DROP INDEX IF EXISTS idx_wallet_person;
DROP INDEX IF EXISTS idx_transaction_sender_receiver;
DROP INDEX IF EXISTS idx_notification_receiver;
EXPLAIN ANALYZE
SELECT
    w.wallet_id,
    w.wallet_account,
    w.current_amount,
    p.name,
    p.email
FROM wallet w
JOIN person p ON p.person_id = w.person_id
WHERE w.person_id = 5;
CREATE INDEX idx_wallet_person ON wallet(person_id);
EXPLAIN ANALYZE
SELECT
    w.wallet_id,
    w.wallet_account,
    w.current_amount,
    p.name,
    p.email
FROM wallet w
JOIN person p ON p.person_id = w.person_id
WHERE w.person_id = 5;
EXPLAIN ANALYZE
SELECT
    t.transaction_id,
    t.amount_sent,
    t.amount_received,
    t.timestamp_sender,
    t.timestamp_receiver,
    ws.wallet_account AS sender_account,
    wr.wallet_account AS receiver_account
FROM "transaction" t
JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
WHERE t.sender_wallet_id = 3
   OR t.receiver_wallet_id = 3
ORDER BY t.timestamp_sender DESC;
CREATE INDEX idx_transaction_sender_receiver
    ON "transaction"(sender_wallet_id, receiver_wallet_id);
EXPLAIN ANALYZE
SELECT
    t.transaction_id,
    t.amount_sent,
    t.amount_received,
    t.timestamp_sender,
    t.timestamp_receiver,
    ws.wallet_account AS sender_account,
    wr.wallet_account AS receiver_account
FROM "transaction" t
JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
WHERE t.sender_wallet_id = 3
   OR t.receiver_wallet_id = 3
ORDER BY t.timestamp_sender DESC;
EXPLAIN ANALYZE
SELECT
    n.notification_id,
    n.notification_timestamp,
    t.amount_sent,
    t.amount_received,
    p_sender.name  AS sender_name,
    p_recv.name    AS receiver_name
FROM notification n
JOIN "transaction" t  ON t.transaction_id   = n.transaction_id
JOIN wallet ws        ON ws.wallet_id        = t.sender_wallet_id
JOIN person p_sender  ON p_sender.person_id  = ws.person_id
JOIN wallet wr        ON wr.wallet_id        = t.receiver_wallet_id
JOIN person p_recv    ON p_recv.person_id    = wr.person_id
WHERE n.receiver_id = 7
ORDER BY n.notification_timestamp DESC;
CREATE INDEX idx_notification_receiver ON notification(receiver_id);
EXPLAIN ANALYZE
SELECT
    n.notification_id,
    n.notification_timestamp,
    t.amount_sent,
    t.amount_received,
    p_sender.name  AS sender_name,
    p_recv.name    AS receiver_name
FROM notification n
JOIN "transaction" t  ON t.transaction_id   = n.transaction_id
JOIN wallet ws        ON ws.wallet_id        = t.sender_wallet_id
JOIN person p_sender  ON p_sender.person_id  = ws.person_id
JOIN wallet wr        ON wr.wallet_id        = t.receiver_wallet_id
JOIN person p_recv    ON p_recv.person_id    = wr.person_id
WHERE n.receiver_id = 7
ORDER BY n.notification_timestamp DESC;
EXPLAIN ANALYZE
SELECT
    p.name         AS admin_name,
    r.month,
    r.year,
    r.amount       AS monthly_revenue
FROM revenue r
JOIN admin  a ON a.admin_person_id = r.admin_person_id
JOIN person p ON p.person_id       = a.admin_person_id
WHERE r.year = 2024
ORDER BY r.month ASC;
