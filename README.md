# Digital Wallet System API

A complete digital wallet banking system REST API built with Django REST Framework and PostgreSQL. The system is similar to EasyPaisa or JazzCash and supports money transfers, bill payments, mobile recharges, debit cards, promotions and a rank based transaction limit system.

---

## Live Server (AWS EC2)

```
http://13.61.104.110:8000/api/v1/
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Python 3.13 | Programming language |
| Django 6.0.2 | Web framework |
| Django REST Framework 3.16.1 | API framework |
| PostgreSQL 16 | Database |
| djangorestframework-simplejwt | JWT authentication |
| Argon2 | Password hashing |
| drf-yasg | Swagger documentation |
| psycopg2 | PostgreSQL adapter |
| python-dotenv | Environment variables |

---

## Features

- JWT authentication with custom claims
- Argon2 password hashing
- Role Based Access Control (RBAC) with 3 roles: User, Merchant, Admin
- 29 REST API endpoints
- Raw SQL queries with explicit BEGIN/COMMIT/ROLLBACK transactions
- PostgreSQL triggers for wallet deductions, notifications and rank updates
- Parameterized queries to prevent SQL injection
- Auto generated debit card number, CVV and expiry date
- Rank system with 5 levels that upgrades automatically
- Promotions expire automatically based on duration
- Connection pooling with CONN_MAX_AGE

---

## Project Structure

```
backend/
├── api/
│   ├── models.py           # 16 database models
│   ├── views.py            # 29 API endpoints using raw SQL
│   ├── urls.py             # URL routing
│   ├── permissions.py      # 6 RBAC permission classes
│   └── authentication.py  # Custom JWT authentication
├── backend/
│   ├── settings.py         # Django configuration
│   ├── urls.py             # Main URL configuration
│   └── .env                # Environment variables
├── manage.py
├── requirements.txt
└── swagger.yaml            # OpenAPI 3.0 documentation
```

---

## Local Setup

### 1. Clone and navigate to project

```bash
git clone <https://github.com/Fizzah-Amir/Digital-Wallet->
cd backend
```

### 2. Create and activate virtual environment

```bash
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the `backend/` folder:

```
DB_NAME=digital_wallet
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

### 5. Setup PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE digital_wallet;"
psql -U postgres -d digital_wallet -f database.sql
```

### 6. Run migrations

```bash
python manage.py migrate --fake
```

### 7. Start the server

```bash
python manage.py runserver
```

Server runs at `http://127.0.0.1:8000/`

---

## Cloud Deployment (AWS EC2)

The project is already deployed on AWS EC2 at `http://13.61.104.110:8000/`

### EC2 Server Details

| Detail | Value |
|---|---|
| Public IP | 13.61.104.110 |
| Operating System | Ubuntu 22.04 LTS |
| PostgreSQL Version | 16 |
| Python Version | 3.12 |
| Project Path | /home/ubuntu/backend |
| Virtual Environment | /home/ubuntu/venv |

---

### How to Start the Cloud Server Again

If the EC2 server stops or restarts follow these steps:

#### Step 1 - Connect to EC2 from your Mac terminal

```bash
ssh -i ~/Downloads/digital-wallet-key.pem ubuntu@13.61.104.110
```

#### Step 2 - Navigate to project and activate virtual environment

```bash
cd /home/ubuntu/backend
source /home/ubuntu/venv/bin/activate
```

#### Step 3 - Start PostgreSQL if it is not running

```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

You should see `Active: active (running)`. If it is already running skip this step.

#### Step 4 - Run the server

```bash
python manage.py runserver 0.0.0.0:8000
```

Your API is now live at:
```
http://13.61.104.110:8000/api/v1/
```

---

### How to Re-deploy Updated Code to EC2

If you make changes to the code on your local machine and want to push them to EC2:

#### Step 1 - Upload updated project from your Mac terminal

```bash
rsync -avz --exclude='venv' --exclude='__pycache__' --exclude='.DS_Store' \
-e "ssh -i ~/Downloads/digital-wallet-key.pem" \
/Users/zohaasad/Desktop/backend ubuntu@13.61.104.110:/home/ubuntu/
```

#### Step 2 - Connect to EC2

```bash
ssh -i ~/Downloads/digital-wallet-key.pem ubuntu@13.61.104.110
```

#### Step 3 - Activate virtual environment and restart server

```bash
cd /home/ubuntu/backend
source /home/ubuntu/venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

---

### How to Deploy Fresh on a New EC2 Instance

If you need to deploy on a completely new EC2 instance from scratch:

#### Step 1 - Connect to new EC2 instance

```bash
ssh -i ~/Downloads/digital-wallet-key.pem ubuntu@<new-ec2-ip>
```

#### Step 2 - Install required packages

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx -y
```

#### Step 3 - Start and enable PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Step 4 - Fix PostgreSQL authentication

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Find this line and change `peer` to `md5`:
```
local   all   postgres   peer
```

Save and restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

#### Step 5 - Set PostgreSQL password

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_db_password';"
```

#### Step 6 - Create database

```bash
sudo -u postgres psql -c "CREATE DATABASE digital_wallet;"
```

#### Step 7 - Upload project from your Mac terminal

Open a new terminal on your Mac and run:

```bash
rsync -avz --exclude='venv' --exclude='__pycache__' --exclude='.DS_Store' \
-e "ssh -i ~/Downloads/digital-wallet-key.pem" \
/Users/zohaasad/Desktop/backend ubuntu@<new-ec2-ip>:/home/ubuntu/
```

#### Step 8 - Upload database dump from your Mac terminal

```bash
pg_dump -U postgres -h localhost -d digital_wallet -f ~/Desktop/digital_wallet_backup.sql
scp -i ~/Downloads/digital-wallet-key.pem ~/Desktop/digital_wallet_backup.sql ubuntu@<new-ec2-ip>:/home/ubuntu/
```

#### Step 9 - Back on EC2 create virtual environment and install packages

```bash
cd /home/ubuntu
python3 -m venv venv
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

#### Step 10 - Import database

```bash
psql -U postgres -h localhost -d digital_wallet -W -f /home/ubuntu/digital_wallet_backup.sql
```

Enter password `zoha1234` when prompted.

#### Step 11 - Update settings.py with new EC2 IP

```bash
nano backend/settings.py
```

Update:
```python
ALLOWED_HOSTS = ['<new-ec2-ip>', 'localhost', '127.0.0.1']


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'digital_wallet',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
        'CONN_MAX_AGE': 60,
    }
}
```

#### Step 12 - Open port 8000 in AWS Security Group

1. Go to AWS Console
2. Click EC2 then your instance
3. Click Security tab
4. Click Edit inbound rules
5. Add rule: Custom TCP, Port 8000, Source Anywhere 0.0.0.0/0
6. Save rules

#### Step 13 - Run the server

```bash
python manage.py check
python manage.py runserver 0.0.0.0:8000
```

---

## API Documentation

Paste the contents of `swagger.yaml` at [https://editor.swagger.io](https://editor.swagger.io) to view the full interactive API documentation.

---

## Authentication

All protected endpoints require a JWT Bearer token in the request header:

```
Authorization: Bearer <access_token>
```

- Access token expires in **60 minutes**
- Refresh token expires in **1 day**

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/register/ | Public |
| POST | /api/v1/login/ | Public |
| POST | /api/v1/logout/ | All roles |

### Profile
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/profile/ | All roles |
| PUT | /api/v1/profile/update/ | All roles |

### Wallet
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/wallet/ | All roles |
| GET | /api/v1/wallet/all/ | Admin only |

### Transactions
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/transfer/ | User and Merchant |
| GET | /api/v1/transactions/ | All roles |
| GET | /api/v1/transactions/sent/ | All roles |
| GET | /api/v1/transactions/received/ | All roles |

### Bill Payment
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/bill-payment/ | User only |
| GET | /api/v1/bill-payment/history/ | User only |

### Mobile Recharge
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/recharge/services/ | User only |
| POST | /api/v1/recharge/ | User only |
| GET | /api/v1/recharge/history/ | User only |

### Debit Cards
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/debit-card/register/ | User only |
| GET | /api/v1/debit-card/my-cards/ | User only |

### Notifications
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/notifications/ | All roles |

### Rank
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/rank/ | User only |

### Promotions
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/promotions/ | All roles |
| POST | /api/v1/merchant/promotion/create/ | Merchant only |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/admin/users/ | Admin only |
| GET | /api/v1/admin/users/{person_id}/ | Admin only |
| GET | /api/v1/admin/revenue/ | Admin only |
| GET | /api/v1/admin/merchants/ | Admin only |
| GET | /api/v1/admin/bill-payments/ | Admin only |
| GET | /api/v1/admin/recharges/ | Admin only |
| GET | /api/v1/admin/wallets/ | Admin only |

---

#### Roles and Permissions

### User
- Send and receive money
- Pay utility bills
- Mobile recharge
- Register one debit card (system auto generates card details)
- View wallet, transactions, rank, notifications and promotions

### Merchant
- Send and receive money
- Create promotions (cost deducted from wallet)
- View wallet, transactions, notifications and promotions
- Cannot do bill payment, mobile recharge or register debit card

### Admin
- View all wallets, transactions, users and merchants
- View all bill payments, recharges and revenue reports
- Automatically receives income from debit card fees and promotion costs via triggers
- Cannot send money, pay bills, recharge or register debit card

---

## Rank System

| Rank | Transactions Required |
|------|----------------------|
| Bronze | 0 - 10 |
| Silver | 11 - 25 |
| Gold | 26 - 50 |
| Platinum | 51 - 100 |
| Diamond | 100+ |

---

## Database Tables

`person` `user` `admin` `merchant` `wallet` `transaction` `notification` `transaction_notification` `bill_payment` `revenue` `promotion` `rank` `rank_of_users` `debit_cards` `telecom_service` `mobile_recharge`

### PostgreSQL Triggers

| Trigger | Event | Purpose |
|---------|-------|---------|
| check_rank_transaction_limit | BEFORE INSERT on transaction | Validates transfer amount against rank limit |
| deduct_wallet_on_transaction | AFTER INSERT on transaction | Deducts sender wallet and credits receiver wallet |
| create_transaction_notifications | AFTER INSERT on transaction | Creates notifications for sender and receiver |
| update_rank_on_transaction | AFTER INSERT on transaction | Updates user rank based on transaction count |
| deduct_wallet_on_bill_payment | AFTER INSERT on bill_payment | Deducts amount from user wallet |
| deduct_wallet_on_recharge | AFTER INSERT on mobile_recharge | Deducts amount from user wallet |
| deduct_debit_card_fee | AFTER INSERT on debit_cards | Deducts card fee and credits admin wallet |
| deduct_promotion_cost | AFTER INSERT on promotion | Deducts promotion cost and credits admin wallet |

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin.main@easypaisa.com | adminpass123 |
| User | ali.hassan@gmail.com | password123 |
| Merchant | merchant.foodpanda@fp.com | merchantpass1 |
| User (0 balance) | pooruser@gmail.com | testpass123 |

---

## Security

- Passwords hashed with **Argon2**
- JWT tokens signed and verified with SECRET_KEY
- All SQL queries **parameterized** to prevent SQL injection
- RBAC enforced on every endpoint
- Same error message for wrong email and wrong password
- Token expires after 60 minutes

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| DB_NAME | PostgreSQL database name |
| DB_USER | PostgreSQL username |
| DB_PASSWORD | PostgreSQL password |
| DB_HOST | Database host |
| DB_PORT | Database port (default 5432) |

---

## Notes

- All write operations use explicit `BEGIN` / `COMMIT` / `ROLLBACK`
- Django ORM is not used — all queries are raw SQL
- Each user is allowed only **one debit card**
- Debit card details are **auto generated** by the system
- Promotions expire automatically — no manual deletion required
- `managed = True` is used in models to prevent Django from recreating existing tables
