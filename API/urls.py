from django.urls import path
from . import views

urlpatterns = [
   
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),

   
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),

    path('wallet/', views.get_wallet, name='get_wallet'),
    path('wallet/all/', views.get_all_wallets, name='get_all_wallets'),

  
    path('transfer/', views.transfer_money, name='transfer_money'),
    path('transactions/', views.transaction_history, name='transaction_history'),
    path('transactions/sent/', views.sent_transactions, name='sent_transactions'),
    path('transactions/received/', views.received_transactions, name='received_transactions'),


    path('bill-payment/', views.bill_payment, name='bill_payment'),
    path('bill-payment/history/', views.bill_payment_history, name='bill_payment_history'),

    
    path('recharge/services/', views.get_telecom_services, name='get_telecom_services'),
    path('recharge/', views.mobile_recharge, name='mobile_recharge'),
    path('recharge/history/', views.recharge_history, name='recharge_history'),

    
    path('debit-card/register/', views.register_debit_card, name='register_debit_card'),
    path('debit-card/my-cards/', views.my_debit_cards, name='my_debit_cards'),

    
    path('notifications/', views.get_notifications, name='get_notifications'),

    
    path('rank/', views.get_rank, name='get_rank'),

    
    path('promotions/', views.get_promotions, name='get_promotions'),
    path('merchant/promotion/create/', views.create_promotion, name='create_promotion'),
    
    
    path('admin/users/', views.get_all_users, name='get_all_users'),
    path('admin/users/<int:person_id>/', views.get_single_user, name='get_single_user'),
    path('admin/revenue/', views.get_revenue, name='get_revenue'),
    path('admin/merchants/', views.get_all_merchants, name='get_all_merchants'),
    path('admin/bill-payments/', views.get_all_bill_payments, name='get_all_bill_payments'),
    path('admin/recharges/', views.get_all_recharges, name='get_all_recharges'),
    path('admin/wallets/', views.get_all_wallets, name='admin_wallets'),
]