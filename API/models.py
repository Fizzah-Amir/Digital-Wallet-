from django.db import models


class User(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('merchant', 'Merchant'),
        ('user', 'User'),
    )
    person_id    = models.AutoField(primary_key=True)
    email        = models.EmailField(max_length=100, unique=True)
    name         = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, unique=True)
    password     = models.CharField(max_length=255)
    cnic         = models.CharField(max_length=100, unique=True)
    person_type  = models.CharField(max_length=10, choices=ROLE_CHOICES)

    class Meta:
        db_table = 'person'
        managed  = True

class UserInfo(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
    user_person   = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='user_person_id')
    date_of_birth = models.DateField()
    gender        = models.CharField(max_length=10, choices=GENDER_CHOICES)

    class Meta:
        db_table = 'user'
        managed  = True


class Admin(models.Model):
    admin_person = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='admin_person_id')

    class Meta:
        db_table = 'admin'
        managed  = True


class Merchant(models.Model):
    merchant_person = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='merchant_person_id')

    class Meta:
        db_table = 'merchant'
        managed  = True


class Wallet(models.Model):
    wallet_id      = models.AutoField(primary_key=True)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2)
    wallet_account = models.CharField(max_length=16, unique=True)
    person         = models.OneToOneField(User, on_delete=models.CASCADE, db_column='person_id')

    class Meta:
        db_table = 'wallet'
        managed  = True


class Transaction(models.Model):
    transaction_id     = models.AutoField(primary_key=True)
    sender_wallet      = models.ForeignKey(Wallet, on_delete=models.CASCADE, db_column='sender_wallet_id', related_name='sent_transactions')
    receiver_wallet    = models.ForeignKey(Wallet, on_delete=models.CASCADE, db_column='receiver_wallet_id', related_name='received_transactions')
    amount_sent        = models.DecimalField(max_digits=10, decimal_places=2)
    amount_received    = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp_sender   = models.DateTimeField()
    timestamp_receiver = models.DateTimeField()

    class Meta:
        db_table = 'transaction'
        managed  = True


class Notification(models.Model):
    notification_id        = models.AutoField(primary_key=True)
    receiver               = models.ForeignKey(User, on_delete=models.CASCADE, db_column='receiver_id')
    notification_timestamp = models.DateTimeField()

    class Meta:
        db_table = 'notification'
        managed  = True


class TransactionNotification(models.Model):
    transaction  = models.ForeignKey(Transaction, on_delete=models.CASCADE, db_column='transaction_id')
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, db_column='notification_id')

    class Meta:
        db_table        = 'transaction_notification'
        managed         = True
        unique_together = (('transaction', 'notification'),)


class BillPayment(models.Model):
    bill_payment_id     = models.AutoField(primary_key=True)
    wallet              = models.ForeignKey(Wallet, on_delete=models.CASCADE, db_column='wallet_id')
    amount              = models.DecimalField(max_digits=10, decimal_places=2)
    consumer_account_no = models.CharField(max_length=16)

    class Meta:
        db_table = 'bill_payment'
        managed  = True


class Revenue(models.Model):
    revenue_id   = models.AutoField(primary_key=True)
    month        = models.IntegerField()
    year         = models.IntegerField()
    amount       = models.DecimalField(max_digits=10, decimal_places=2)
    admin_person = models.ForeignKey(Admin, on_delete=models.CASCADE, db_column='admin_person_id')

    class Meta:
        db_table = 'revenue'
        managed  = True


class Promotion(models.Model):
    promotion_id              = models.AutoField(primary_key=True)
    merchant_person           = models.ForeignKey(Merchant, on_delete=models.CASCADE, db_column='merchant_person_id')
    admin_person              = models.ForeignKey(Admin, on_delete=models.CASCADE, db_column='admin_person_id')
    promotion_cost            = models.DecimalField(max_digits=10, decimal_places=2)
    duration                  = models.IntegerField()
    promotional_advertisement = models.TextField()

    class Meta:
        db_table = 'promotion'
        managed  = True


class Rank(models.Model):
    rank_id         = models.AutoField(primary_key=True)
    rank_name       = models.CharField(max_length=50, unique=True)
    min_transaction = models.IntegerField()
    max_transaction = models.IntegerField()
    min_amount      = models.DecimalField(max_digits=10, decimal_places=2)
    max_amount      = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'rank'
        managed  = True


class RankOfUsers(models.Model):
    person            = models.OneToOneField(UserInfo, on_delete=models.CASCADE, primary_key=True, db_column='person_id')
    rank              = models.ForeignKey(Rank, on_delete=models.CASCADE, db_column='rank_id')
    no_of_transaction = models.IntegerField(default=0)

    class Meta:
        db_table = 'rank_of_users'
        managed  = True


class DebitCard(models.Model):
    card_number     = models.CharField(max_length=16, primary_key=True)
    person_user     = models.ForeignKey(UserInfo, on_delete=models.CASCADE, db_column='person_user_id')
    cvv             = models.CharField(max_length=3)
    registered_date = models.DateField()
    expiry_date     = models.DateField()
    card_fee        = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)

    class Meta:
        db_table = 'debit_cards'
        managed  = True


class TelecomService(models.Model):
    service_id      = models.AutoField(primary_key=True)
    service_name    = models.CharField(max_length=50, unique=True)
    company_account = models.CharField(max_length=16, unique=True)

    class Meta:
        db_table = 'telecom_service'
        managed  = True


class MobileRecharge(models.Model):
    mobile_recharge_id = models.AutoField(primary_key=True)
    wallet             = models.ForeignKey(Wallet, on_delete=models.CASCADE, db_column='wallet_id')
    service            = models.ForeignKey(TelecomService, on_delete=models.CASCADE, db_column='service_id')
    amount             = models.DecimalField(max_digits=10, decimal_places=2)
    recharge_timestamp = models.DateTimeField()

    class Meta:
        db_table = 'mobile_recharge'
        managed  = True