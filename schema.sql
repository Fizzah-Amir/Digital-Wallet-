 DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

CREATE TABLE IF NOT EXISTS person (
    person_id    SERIAL PRIMARY KEY,
    email        VARCHAR(100) UNIQUE NOT NULL CHECK (email LIKE '%@%.%'),
    name         VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL CHECK (LENGTH(phone_number) = 11),
    password     VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 8),
    cnic         VARCHAR(100) UNIQUE NOT NULL,
    person_type  VARCHAR(10) NOT NULL CHECK (person_type IN ('admin', 'merchant', 'user'))
);

CREATE TABLE IF NOT EXISTS "user" (
    user_person_id INT PRIMARY KEY REFERENCES person(person_id),
    date_of_birth  DATE NOT NULL CHECK (date_of_birth <= (CURRENT_DATE - INTERVAL '18 years')),
    gender         VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female'))
);

CREATE TABLE IF NOT EXISTS admin (
    admin_person_id INT PRIMARY KEY REFERENCES person(person_id)
);

CREATE TABLE IF NOT EXISTS merchant (
    merchant_person_id INT PRIMARY KEY REFERENCES person(person_id)
);

CREATE TABLE IF NOT EXISTS wallet (
    wallet_id      SERIAL PRIMARY KEY,
    current_amount DECIMAL(10,2) NOT NULL CHECK (current_amount >= 0),
    wallet_account CHAR(16) UNIQUE NOT NULL,
    person_id      INT NOT NULL UNIQUE REFERENCES person(person_id)
);

CREATE TABLE IF NOT EXISTS "transaction" (
    transaction_id     SERIAL PRIMARY KEY,
    sender_wallet_id   INT NOT NULL REFERENCES wallet(wallet_id),
    receiver_wallet_id INT NOT NULL REFERENCES wallet(wallet_id),
    amount_sent        DECIMAL(10,2) NOT NULL CHECK (amount_sent >= 0),
    amount_received    DECIMAL(10,2) NOT NULL CHECK (amount_received >= 0),
    timestamp_sender   TIMESTAMP NOT NULL,
    timestamp_receiver TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS notification (
    notification_id        SERIAL PRIMARY KEY,
    receiver_id            INT NOT NULL REFERENCES person(person_id),
    notification_timestamp TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_notification (
    transaction_id  INT NOT NULL REFERENCES "transaction"(transaction_id),
    notification_id INT NOT NULL REFERENCES notification(notification_id),
    PRIMARY KEY (transaction_id, notification_id)
);

CREATE TABLE IF NOT EXISTS bill_payment (
    bill_payment_id     SERIAL PRIMARY KEY,
    wallet_id           INT NOT NULL REFERENCES wallet(wallet_id),
    amount              DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    consumer_account_no CHAR(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue (
    revenue_id      SERIAL PRIMARY KEY,
    month           INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year            INT NOT NULL,
    amount          DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    admin_person_id INT NOT NULL REFERENCES admin(admin_person_id)
);

CREATE TABLE IF NOT EXISTS promotion (
    promotion_id              SERIAL PRIMARY KEY,
    merchant_person_id        INT NOT NULL REFERENCES merchant(merchant_person_id),
    admin_person_id           INT NOT NULL REFERENCES admin(admin_person_id),
    promotion_cost            DECIMAL(10,2) NOT NULL CHECK (promotion_cost >= 0),
    duration                  INT NOT NULL CHECK (duration > 0),
    promotional_advertisement TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rank (
    rank_id         SERIAL PRIMARY KEY,
    rank_name       VARCHAR(50) UNIQUE NOT NULL,
    min_transaction INT NOT NULL,
    max_transaction INT NOT NULL,
    min_amount      DECIMAL(10,2) NOT NULL CHECK (min_amount >= 0),
    max_amount      DECIMAL(10,2) NOT NULL CHECK (max_amount >= 0),
    CHECK (min_transaction <= max_transaction),
    CHECK (min_amount <= max_amount)
);

CREATE TABLE IF NOT EXISTS rank_of_users (
    person_id         INT PRIMARY KEY REFERENCES "user"(user_person_id),
    rank_id           INT NOT NULL REFERENCES rank(rank_id),
    no_of_transaction INT NOT NULL DEFAULT 0 CHECK (no_of_transaction >= 0)
);

CREATE TABLE IF NOT EXISTS debit_cards (
    card_number     CHAR(16) PRIMARY KEY,
    person_user_id  INT NOT NULL REFERENCES "user"(user_person_id),
    cvv             CHAR(3) NOT NULL,
    registered_date DATE NOT NULL,
    expiry_date     DATE NOT NULL,
    card_fee        DECIMAL(10,2) NOT NULL DEFAULT 500.00 CHECK (card_fee >= 0),
    CHECK (expiry_date > registered_date)
);

CREATE TABLE IF NOT EXISTS telecom_service (
    service_id      SERIAL PRIMARY KEY,
    service_name    VARCHAR(50) UNIQUE NOT NULL,
    company_account CHAR(16) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS mobile_recharge (
    mobile_recharge_id SERIAL PRIMARY KEY,
    wallet_id          INT NOT NULL REFERENCES wallet(wallet_id),
    service_id         INT NOT NULL REFERENCES telecom_service(service_id),
    amount             DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    recharge_timestamp TIMESTAMP NOT NULL
);

CREATE INDEX idx_wallet_person ON wallet(person_id);
CREATE INDEX idx_transaction_sender_receiver ON "transaction"(sender_wallet_id, receiver_wallet_id);

CREATE OR REPLACE FUNCTION check_rank_transaction_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_min_amount DECIMAL(10,2);
    v_max_amount DECIMAL(10,2);
    v_rank_name  VARCHAR(50);
BEGIN
    SELECT r.min_amount, r.max_amount, r.rank_name
    INTO v_min_amount, v_max_amount, v_rank_name
    FROM rank_of_users rou
    JOIN rank r ON r.rank_id = rou.rank_id
    WHERE rou.person_id = (
        SELECT person_id FROM wallet
        WHERE wallet_id = NEW.sender_wallet_id
    );

    IF v_max_amount IS NOT NULL AND NEW.amount_sent > v_max_amount THEN
        RAISE EXCEPTION 'Amount exceeds your % rank maximum limit of Rs %',
            v_rank_name, v_max_amount;
    END IF;

    IF v_min_amount IS NOT NULL AND NEW.amount_sent < v_min_amount THEN
        RAISE EXCEPTION 'Amount is below your % rank minimum of Rs %',
            v_rank_name, v_min_amount;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_rank_limit ON "transaction";
CREATE TRIGGER trg_check_rank_limit
BEFORE INSERT ON "transaction"
FOR EACH ROW EXECUTE FUNCTION check_rank_transaction_limit();


CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT current_amount FROM wallet WHERE wallet_id = NEW.sender_wallet_id) < NEW.amount_sent THEN
        RAISE EXCEPTION 'Insufficient balance in sender wallet';
    END IF;

    UPDATE wallet SET current_amount = current_amount - NEW.amount_sent
    WHERE wallet_id = NEW.sender_wallet_id;

    UPDATE wallet SET current_amount = current_amount + NEW.amount_received
    WHERE wallet_id = NEW.receiver_wallet_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_wallet_balance ON "transaction";
CREATE TRIGGER trg_update_wallet_balance
AFTER INSERT ON "transaction"
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();


CREATE OR REPLACE FUNCTION create_transaction_notifications()
RETURNS TRIGGER AS $$
DECLARE
    v_sender_notification_id   INT;
    v_receiver_notification_id INT;
BEGIN
    INSERT INTO notification(receiver_id, notification_timestamp)
    VALUES ((SELECT person_id FROM wallet WHERE wallet_id = NEW.sender_wallet_id), NOW())
    RETURNING notification_id INTO v_sender_notification_id;

    INSERT INTO notification(receiver_id, notification_timestamp)
    VALUES ((SELECT person_id FROM wallet WHERE wallet_id = NEW.receiver_wallet_id), NOW())
    RETURNING notification_id INTO v_receiver_notification_id;

    INSERT INTO transaction_notification(transaction_id, notification_id)
    VALUES (NEW.transaction_id, v_sender_notification_id);

    INSERT INTO transaction_notification(transaction_id, notification_id)
    VALUES (NEW.transaction_id, v_receiver_notification_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_notifications ON "transaction";
CREATE TRIGGER trg_create_notifications
AFTER INSERT ON "transaction"
FOR EACH ROW EXECUTE FUNCTION create_transaction_notifications();


CREATE OR REPLACE FUNCTION deduct_wallet_on_bill_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT current_amount FROM wallet WHERE wallet_id = NEW.wallet_id) < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance for bill payment';
    END IF;

    UPDATE wallet SET current_amount = current_amount - NEW.amount
    WHERE wallet_id = NEW.wallet_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_bill_payment ON bill_payment;
CREATE TRIGGER trg_deduct_bill_payment
AFTER INSERT ON bill_payment
FOR EACH ROW EXECUTE FUNCTION deduct_wallet_on_bill_payment();


CREATE OR REPLACE FUNCTION deduct_wallet_on_recharge()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT current_amount FROM wallet WHERE wallet_id = NEW.wallet_id) < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance for mobile recharge';
    END IF;

    UPDATE wallet SET current_amount = current_amount - NEW.amount
    WHERE wallet_id = NEW.wallet_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_mobile_recharge ON mobile_recharge;
CREATE TRIGGER trg_deduct_mobile_recharge
AFTER INSERT ON mobile_recharge
FOR EACH ROW EXECUTE FUNCTION deduct_wallet_on_recharge();


CREATE OR REPLACE FUNCTION update_transaction_count()
RETURNS TRIGGER AS $$
DECLARE
    v_sender_person_id   INT;
    v_receiver_person_id INT;
BEGIN
    SELECT person_id INTO v_sender_person_id
    FROM wallet WHERE wallet_id = NEW.sender_wallet_id;

    SELECT person_id INTO v_receiver_person_id
    FROM wallet WHERE wallet_id = NEW.receiver_wallet_id;

    UPDATE rank_of_users SET no_of_transaction = no_of_transaction + 1
    WHERE person_id = v_sender_person_id;

    UPDATE rank_of_users SET no_of_transaction = no_of_transaction + 1
    WHERE person_id = v_receiver_person_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_transaction_count ON "transaction";
CREATE TRIGGER trg_update_transaction_count
AFTER INSERT ON "transaction"
FOR EACH ROW EXECUTE FUNCTION update_transaction_count();


CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
DECLARE
    v_new_rank_id INT;
BEGIN
    SELECT rank_id INTO v_new_rank_id
    FROM rank
    WHERE NEW.no_of_transaction >= min_transaction
    AND   NEW.no_of_transaction <= max_transaction;

    IF v_new_rank_id IS NOT NULL AND v_new_rank_id <> NEW.rank_id THEN
        UPDATE rank_of_users
        SET rank_id = v_new_rank_id
        WHERE person_id = NEW.person_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_rank ON rank_of_users;
CREATE TRIGGER trg_update_user_rank
AFTER UPDATE OF no_of_transaction ON rank_of_users
FOR EACH ROW EXECUTE FUNCTION update_user_rank();


CREATE OR REPLACE FUNCTION add_promotion_revenue()
RETURNS TRIGGER AS $$
DECLARE
    v_merchant_wallet_id INT;
    v_admin_wallet_id    INT;
BEGIN
    SELECT wallet_id INTO v_merchant_wallet_id
    FROM wallet WHERE person_id = NEW.merchant_person_id;

    SELECT wallet_id INTO v_admin_wallet_id
    FROM wallet WHERE person_id = NEW.admin_person_id;

    IF (SELECT current_amount FROM wallet WHERE wallet_id = v_merchant_wallet_id) < NEW.promotion_cost THEN
        RAISE EXCEPTION 'Merchant has insufficient balance to pay for promotion of Rs %',
            NEW.promotion_cost;
    END IF;

    UPDATE wallet SET current_amount = current_amount - NEW.promotion_cost
    WHERE wallet_id = v_merchant_wallet_id;

    UPDATE wallet SET current_amount = current_amount + NEW.promotion_cost
    WHERE wallet_id = v_admin_wallet_id;

    IF EXISTS (
        SELECT 1 FROM revenue
        WHERE month           = EXTRACT(MONTH FROM NOW())
        AND   year            = EXTRACT(YEAR  FROM NOW())
        AND   admin_person_id = NEW.admin_person_id
    ) THEN
        UPDATE revenue
        SET amount = amount + NEW.promotion_cost
        WHERE month           = EXTRACT(MONTH FROM NOW())
        AND   year            = EXTRACT(YEAR  FROM NOW())
        AND   admin_person_id = NEW.admin_person_id;
    ELSE
        INSERT INTO revenue (month, year, amount, admin_person_id)
        VALUES (EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW()), NEW.promotion_cost, NEW.admin_person_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_add_promotion_revenue ON promotion;
CREATE TRIGGER trg_add_promotion_revenue
AFTER INSERT ON promotion
FOR EACH ROW EXECUTE FUNCTION add_promotion_revenue();


CREATE OR REPLACE FUNCTION check_debit_card_expiry()
RETURNS TRIGGER AS $$
DECLARE
    v_person_id INT;
BEGIN
    SELECT person_id INTO v_person_id
    FROM wallet WHERE wallet_id = NEW.sender_wallet_id;

    IF EXISTS (
        SELECT 1 FROM debit_cards
        WHERE person_user_id = v_person_id
        AND expiry_date < CURRENT_DATE
    ) THEN
        RAISE EXCEPTION 'Your debit card has expired. Please update your card details.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_debit_card_expiry ON "transaction";
CREATE TRIGGER trg_check_debit_card_expiry
BEFORE INSERT ON "transaction"
FOR EACH ROW EXECUTE FUNCTION check_debit_card_expiry();


CREATE OR REPLACE FUNCTION check_self_transfer()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sender_wallet_id = NEW.receiver_wallet_id THEN
        RAISE EXCEPTION 'Cannot transfer money to your own wallet';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_self_transfer ON "transaction";
CREATE TRIGGER trg_check_self_transfer
BEFORE INSERT ON "transaction"
FOR EACH ROW EXECUTE FUNCTION check_self_transfer();


CREATE OR REPLACE FUNCTION charge_debit_card_fee()
RETURNS TRIGGER AS $$
DECLARE
    v_user_wallet_id  INT;
    v_admin_wallet_id INT;
    v_admin_person_id INT;
BEGIN
    SELECT wallet_id INTO v_user_wallet_id
    FROM wallet WHERE person_id = NEW.person_user_id;

    IF (SELECT current_amount FROM wallet WHERE wallet_id = v_user_wallet_id) < NEW.card_fee THEN
        RAISE EXCEPTION 'Insufficient balance to pay debit card registration fee of Rs %',
            NEW.card_fee;
    END IF;

    SELECT admin_person_id INTO v_admin_person_id
    FROM admin LIMIT 1;

    SELECT wallet_id INTO v_admin_wallet_id
    FROM wallet WHERE person_id = v_admin_person_id;

    UPDATE wallet SET current_amount = current_amount - NEW.card_fee
    WHERE wallet_id = v_user_wallet_id;

    UPDATE wallet SET current_amount = current_amount + NEW.card_fee
    WHERE wallet_id = v_admin_wallet_id;

    IF EXISTS (
        SELECT 1 FROM revenue
        WHERE month           = EXTRACT(MONTH FROM NOW())
        AND   year            = EXTRACT(YEAR  FROM NOW())
        AND   admin_person_id = v_admin_person_id
    ) THEN
        UPDATE revenue
        SET amount = amount + NEW.card_fee
        WHERE month           = EXTRACT(MONTH FROM NOW())
        AND   year            = EXTRACT(YEAR  FROM NOW())
        AND   admin_person_id = v_admin_person_id;
    ELSE
        INSERT INTO revenue (month, year, amount, admin_person_id)
        VALUES (EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW()), NEW.card_fee, v_admin_person_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_charge_debit_card_fee ON debit_cards;
CREATE TRIGGER trg_charge_debit_card_fee
AFTER INSERT ON debit_cards
FOR EACH ROW EXECUTE FUNCTION charge_debit_card_fee();


DROP VIEW IF EXISTS vw_promotion_details;
DROP VIEW IF EXISTS vw_transaction_history;
DROP VIEW IF EXISTS vw_user_wallet;

CREATE VIEW vw_user_wallet AS
SELECT
    p.person_id,
    p.name,
    p.email,
    p.person_type,
    w.wallet_id,
    w.wallet_account,
    w.current_amount
FROM person p
JOIN wallet w ON p.person_id      = w.person_id
JOIN "user" u ON u.user_person_id = p.person_id;

CREATE VIEW vw_transaction_history AS
SELECT
    t.transaction_id,
    s.name            AS sender_name,
    r.name            AS receiver_name,
    ws.wallet_account AS sender_account,
    wr.wallet_account AS receiver_account,
    t.amount_sent,
    t.amount_received,
    t.timestamp_sender,
    t.timestamp_receiver
FROM "transaction" t
JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
JOIN person s  ON s.person_id  = ws.person_id
JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
JOIN person r  ON r.person_id  = wr.person_id;

CREATE VIEW vw_promotion_details AS
SELECT
    pr.promotion_id,
    m.name            AS merchant_name,
    a.admin_person_id AS admin_id,
    ap.name           AS admin_name,
    w.wallet_account  AS admin_wallet_account,
    pr.promotion_cost,
    pr.duration,
    pr.promotional_advertisement
FROM promotion pr
JOIN merchant me ON me.merchant_person_id = pr.merchant_person_id
JOIN person   m  ON m.person_id           = me.merchant_person_id
JOIN admin    a  ON a.admin_person_id     = pr.admin_person_id
JOIN person   ap ON ap.person_id          = a.admin_person_id
JOIN wallet   w  ON w.person_id           = a.admin_person_id;
