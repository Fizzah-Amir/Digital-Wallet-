from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db import connection
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status
from api.permissions import (
    IsAdminUser, IsMerchantUser, IsRegularUser,
    IsAnyRole, IsAdminOrUser, IsUserOrMerchant, IsAdminOrMerchant
)
import random
from datetime import date
ph = PasswordHasher()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data         = request.data
    name         = data.get('name')
    email        = data.get('email')
    phone_number = data.get('phone_number')
    password     = data.get('password')
    cnic         = data.get('cnic')
    person_type  = data.get('person_type')

    if not all([name, email, phone_number, password, cnic, person_type]):
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    if person_type not in ['admin', 'merchant', 'user']:
        return Response({'error': 'Invalid person_type'}, status=status.HTTP_400_BAD_REQUEST)

    hashed_password = ph.hash(password)

    try:
        with connection.cursor() as cursor:
            cursor.execute("BEGIN")

            cursor.execute("""
                INSERT INTO person (name, email, phone_number, password, cnic, person_type)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING person_id
            """, [name, email, phone_number, hashed_password, cnic, person_type])
            person_id = cursor.fetchone()[0]

            if person_type == 'user':
                date_of_birth = data.get('date_of_birth')
                gender        = data.get('gender')
                if not all([date_of_birth, gender]):
                    cursor.execute("ROLLBACK")
                    return Response({'error': 'date_of_birth and gender required for user'}, status=status.HTTP_400_BAD_REQUEST)
                cursor.execute("""
                    INSERT INTO "user" (user_person_id, date_of_birth, gender)
                    VALUES (%s, %s, %s)
                """, [person_id, date_of_birth, gender])
                cursor.execute("""
                    INSERT INTO rank_of_users (person_id, rank_id, no_of_transaction)
                    VALUES (%s, (SELECT rank_id FROM rank WHERE rank_name = 'Bronze'), 0)
                """, [person_id])

            elif person_type == 'merchant':
                cursor.execute("""
                    INSERT INTO merchant (merchant_person_id) VALUES (%s)
                """, [person_id])

            elif person_type == 'admin':
                cursor.execute("""
                    INSERT INTO admin (admin_person_id) VALUES (%s)
                """, [person_id])

            wallet_account = ''.join([str(random.randint(0, 9)) for _ in range(16)])
            cursor.execute("""
                INSERT INTO wallet (current_amount, wallet_account, person_id)
                VALUES (%s, %s, %s)
            """, [0.00, wallet_account, person_id])

            cursor.execute("COMMIT")

        return Response({
            'message':        'Registered successfully',
            'person_id':      person_id,
            'wallet_account': wallet_account
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email    = request.data.get('email')
    password = request.data.get('password')

    if not all([email, password]):
        return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT person_id, password, person_type, name
                FROM person WHERE email = %s
            """, [email])
            row = cursor.fetchone()

        if not row:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        person_id, hashed_password, person_type, name = row

        ph.verify(hashed_password, password)

        refresh                = RefreshToken()
        refresh['person_id']   = person_id
        refresh['person_type'] = person_type
        refresh['name']        = name

        return Response({
            'access':      str(refresh.access_token),
            'refresh':     str(refresh),
            'person_type': person_type,
            'name':        name,
            'person_id':   person_id
        }, status=status.HTTP_200_OK)

    except VerifyMismatchError:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAnyRole])
def logout(request):
    refresh_token = request.data.get('refresh')

    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

    except TokenError:
        return Response({'error': 'Token is invalid or already blacklisted'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAnyRole])
def get_profile(request):
    person_id   = request.user.person_id
    person_type = request.user.person_type

    with connection.cursor() as cursor:
        if person_type == 'user':
            cursor.execute("""
                SELECT p.person_id, p.name, p.email, p.phone_number, p.cnic,
                       p.person_type, u.date_of_birth, u.gender,
                       w.wallet_account, w.current_amount,
                       r.rank_name, rou.no_of_transaction
                FROM person p
                JOIN "user" u ON u.user_person_id = p.person_id
                JOIN wallet w ON w.person_id = p.person_id
                JOIN rank_of_users rou ON rou.person_id = p.person_id
                JOIN rank r ON r.rank_id = rou.rank_id
                WHERE p.person_id = %s
            """, [person_id])
            row = cursor.fetchone()
            if not row:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({
                'person_id':          row[0],
                'name':               row[1],
                'email':              row[2],
                'phone_number':       row[3],
                'cnic':               row[4],
                'person_type':        row[5],
                'date_of_birth':      row[6],
                'gender':             row[7],
                'wallet_account':     row[8],
                'current_amount':     row[9],
                'rank':               row[10],
                'total_transactions': row[11]
            }, status=status.HTTP_200_OK)

        else:
            cursor.execute("""
                SELECT p.person_id, p.name, p.email, p.phone_number,
                       p.cnic, p.person_type, w.wallet_account, w.current_amount
                FROM person p
                JOIN wallet w ON w.person_id = p.person_id
                WHERE p.person_id = %s
            """, [person_id])
            row = cursor.fetchone()
            if not row:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({
                'person_id':      row[0],
                'name':           row[1],
                'email':          row[2],
                'phone_number':   row[3],
                'cnic':           row[4],
                'person_type':    row[5],
                'wallet_account': row[6],
                'current_amount': row[7]
            }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAnyRole])
def update_profile(request):
    person_id = request.user.person_id
    data      = request.data
    name      = data.get('name')
    phone     = data.get('phone_number')

    try:
        with connection.cursor() as cursor:
            cursor.execute("BEGIN")
            cursor.execute("""
                UPDATE person SET name = COALESCE(%s, name),
                phone_number = COALESCE(%s, phone_number)
                WHERE person_id = %s
            """, [name, phone, person_id])
            cursor.execute("COMMIT")

        return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAnyRole])
def get_wallet(request):
    person_id   = request.user.person_id
    person_type = request.user.person_type

    if person_type == 'admin':
        target_id = request.query_params.get('person_id', person_id)
    else:
        target_id = person_id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT w.wallet_id, w.wallet_account, w.current_amount,
                   p.name, p.email, p.person_type
            FROM wallet w
            JOIN person p ON p.person_id = w.person_id
            WHERE w.person_id = %s
        """, [target_id])
        row = cursor.fetchone()

    if not row:
        return Response({'error': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'wallet_id':      row[0],
        'wallet_account': row[1],
        'current_amount': row[2],
        'name':           row[3],
        'email':          row[4],
        'person_type':    row[5]
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_wallets(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT w.wallet_id, w.wallet_account, w.current_amount,
                   p.person_id, p.name, p.email, p.person_type
            FROM wallet w
            JOIN person p ON p.person_id = w.person_id
            ORDER BY p.person_id ASC
        """)
        rows = cursor.fetchall()

    wallets = []
    for row in rows:
        wallets.append({
            'wallet_id':      row[0],
            'wallet_account': row[1],
            'current_amount': row[2],
            'person_id':      row[3],
            'name':           row[4],
            'email':          row[5],
            'person_type':    row[6]
        })

    return Response({'wallets': wallets}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsUserOrMerchant])
def transfer_money(request):
    person_id        = request.user.person_id
    receiver_account = request.data.get('receiver_wallet_account')
    amount           = request.data.get('amount')

    if not all([receiver_account, amount]):
        return Response({'error': 'receiver_wallet_account and amount are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("BEGIN")

            cursor.execute("""
                SELECT wallet_id FROM wallet WHERE person_id = %s
            """, [person_id])
            sender_row = cursor.fetchone()
            if not sender_row:
                cursor.execute("ROLLBACK")
                return Response({'error': 'Sender wallet not found'}, status=status.HTTP_404_NOT_FOUND)
            sender_wallet_id = sender_row[0]

            cursor.execute("""
                SELECT w.wallet_id, p.name FROM wallet w
                JOIN person p ON p.person_id = w.person_id
                WHERE w.wallet_account = %s
            """, [receiver_account])
            receiver_row = cursor.fetchone()
            if not receiver_row:
                cursor.execute("ROLLBACK")
                return Response({'error': 'Receiver wallet not found'}, status=status.HTTP_404_NOT_FOUND)
            receiver_wallet_id = receiver_row[0]
            receiver_name      = receiver_row[1]

            cursor.execute("""
                INSERT INTO "transaction"
                (sender_wallet_id, receiver_wallet_id, amount_sent, amount_received, timestamp_sender, timestamp_receiver)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                RETURNING transaction_id
            """, [sender_wallet_id, receiver_wallet_id, amount, amount])
            transaction_id = cursor.fetchone()[0]

            cursor.execute("COMMIT")

        return Response({
            'message':        'Transfer successful',
            'transaction_id': transaction_id,
            'amount':         amount,
            'receiver_name':  receiver_name
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAnyRole])
def sent_transactions(request):
    person_id   = request.user.person_id
    person_type = request.user.person_type

    with connection.cursor() as cursor:
        if person_type == 'admin':
            cursor.execute("""
                SELECT t.transaction_id, t.amount_sent, t.amount_received,
                       t.timestamp_sender, t.timestamp_receiver,
                       ws.wallet_account, wr.wallet_account,
                       ps.name, pr.name
                FROM "transaction" t
                JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
                JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
                JOIN person ps ON ps.person_id = ws.person_id
                JOIN person pr ON pr.person_id = wr.person_id
                ORDER BY t.timestamp_sender DESC
            """)
        else:
            cursor.execute("""
                SELECT t.transaction_id, t.amount_sent, t.amount_received,
                       t.timestamp_sender, t.timestamp_receiver,
                       ws.wallet_account, wr.wallet_account,
                       ps.name, pr.name
                FROM "transaction" t
                JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
                JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
                JOIN person ps ON ps.person_id = ws.person_id
                JOIN person pr ON pr.person_id = wr.person_id
                WHERE ws.person_id = %s
                ORDER BY t.timestamp_sender DESC
            """, [person_id])
        rows = cursor.fetchall()

    transactions = []
    for row in rows:
        transactions.append({
            'transaction_id':     row[0],
            'amount_sent':        row[1],
            'amount_received':    row[2],
            'timestamp_sender':   row[3],
            'timestamp_receiver': row[4],
            'sender_account':     row[5],
            'receiver_account':   row[6],
            'sender_name':        row[7],
            'receiver_name':      row[8]
        })

    return Response({'sent_transactions': transactions}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAnyRole])
def received_transactions(request):
    person_id = request.user.person_id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT t.transaction_id, t.amount_sent, t.amount_received,
                   t.timestamp_sender, t.timestamp_receiver,
                   ws.wallet_account, wr.wallet_account,
                   ps.name, pr.name
            FROM "transaction" t
            JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
            JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
            JOIN person ps ON ps.person_id = ws.person_id
            JOIN person pr ON pr.person_id = wr.person_id
            WHERE wr.person_id = %s
            ORDER BY t.timestamp_receiver DESC
        """, [person_id])
        rows = cursor.fetchall()

    transactions = []
    for row in rows:
        transactions.append({
            'transaction_id':     row[0],
            'amount_sent':        row[1],
            'amount_received':    row[2],
            'timestamp_sender':   row[3],
            'timestamp_receiver': row[4],
            'sender_account':     row[5],
            'receiver_account':   row[6],
            'sender_name':        row[7],
            'receiver_name':      row[8]
        })

    return Response({'received_transactions': transactions}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAnyRole])
def transaction_history(request):
    person_id   = request.user.person_id
    person_type = request.user.person_type

    with connection.cursor() as cursor:
        if person_type == 'admin':
            cursor.execute("""
                SELECT t.transaction_id, t.amount_sent, t.amount_received,
                       t.timestamp_sender, t.timestamp_receiver,
                       ws.wallet_account, wr.wallet_account,
                       ps.name, pr.name
                FROM "transaction" t
                JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
                JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
                JOIN person ps ON ps.person_id = ws.person_id
                JOIN person pr ON pr.person_id = wr.person_id
                ORDER BY t.timestamp_sender DESC
            """)
        else:
            cursor.execute("""
                SELECT t.transaction_id, t.amount_sent, t.amount_received,
                       t.timestamp_sender, t.timestamp_receiver,
                       ws.wallet_account, wr.wallet_account,
                       ps.name, pr.name
                FROM "transaction" t
                JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
                JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
                JOIN person ps ON ps.person_id = ws.person_id
                JOIN person pr ON pr.person_id = wr.person_id
                WHERE ws.person_id = %s OR wr.person_id = %s
                ORDER BY t.timestamp_sender DESC
            """, [person_id, person_id])
        rows = cursor.fetchall()

    transactions = []
    for row in rows:
        transactions.append({
            'transaction_id':     row[0],
            'amount_sent':        row[1],
            'amount_received':    row[2],
            'timestamp_sender':   row[3],
            'timestamp_receiver': row[4],
            'sender_account':     row[5],
            'receiver_account':   row[6],
            'sender_name':        row[7],
            'receiver_name':      row[8]
        })

    return Response({'transactions': transactions}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsRegularUser])
def bill_payment(request):
    person_id           = request.user.person_id
    consumer_account_no = request.data.get('consumer_account_no')
    amount              = request.data.get('amount')

    if not all([consumer_account_no, amount]):
        return Response({'error': 'consumer_account_no and amount are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("BEGIN")

            cursor.execute("""
                SELECT wallet_id FROM wallet WHERE person_id = %s
            """, [person_id])
            wallet_row = cursor.fetchone()
            if not wallet_row:
                cursor.execute("ROLLBACK")
                return Response({'error': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)
            wallet_id = wallet_row[0]

            cursor.execute("""
                INSERT INTO bill_payment (wallet_id, amount, consumer_account_no)
                VALUES (%s, %s, %s)
                RETURNING bill_payment_id
            """, [wallet_id, amount, consumer_account_no])
            bill_payment_id = cursor.fetchone()[0]

            cursor.execute("COMMIT")

        return Response({
            'message':          'Bill payment successful',
            'bill_payment_id':  bill_payment_id,
            'consumer_account': consumer_account_no,
            'amount':           amount
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsRegularUser])
def bill_payment_history(request):
    person_id = request.user.person_id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT bp.bill_payment_id, bp.amount, bp.consumer_account_no,
                   w.wallet_account
            FROM bill_payment bp
            JOIN wallet w ON w.wallet_id = bp.wallet_id
            WHERE w.person_id = %s
            ORDER BY bp.bill_payment_id DESC
        """, [person_id])
        rows = cursor.fetchall()

    payments = []
    for row in rows:
        payments.append({
            'bill_payment_id':  row[0],
            'amount':           row[1],
            'consumer_account': row[2],
            'wallet_account':   row[3]
        })

    return Response({'bill_payments': payments}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsRegularUser])
def get_telecom_services(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT service_id, service_name, company_account
            FROM telecom_service
            ORDER BY service_id ASC
        """)
        rows = cursor.fetchall()

    services = []
    for row in rows:
        services.append({
            'service_id':      row[0],
            'service_name':    row[1],
            'company_account': row[2]
        })

    return Response({'services': services}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsRegularUser])
def mobile_recharge(request):
    person_id  = request.user.person_id
    service_id = request.data.get('service_id')
    amount     = request.data.get('amount')

    if not all([service_id, amount]):
        return Response({'error': 'service_id and amount are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = float(amount)
        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("BEGIN")

            cursor.execute("""
                SELECT wallet_id FROM wallet WHERE person_id = %s
            """, [person_id])
            wallet_row = cursor.fetchone()
            if not wallet_row:
                cursor.execute("ROLLBACK")
                return Response({'error': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)
            wallet_id = wallet_row[0]

            cursor.execute("""
                SELECT service_id, service_name FROM telecom_service WHERE service_id = %s
            """, [service_id])
            service = cursor.fetchone()
            if not service:
                cursor.execute("ROLLBACK")
                return Response({'error': 'Telecom service not found'}, status=status.HTTP_404_NOT_FOUND)
            service_name = service[1]

            cursor.execute("""
                INSERT INTO mobile_recharge (wallet_id, service_id, amount, recharge_timestamp)
                VALUES (%s, %s, %s, NOW())
                RETURNING mobile_recharge_id
            """, [wallet_id, service_id, amount])
            recharge_id = cursor.fetchone()[0]

            cursor.execute("COMMIT")

        return Response({
            'message':      'Recharge successful',
            'recharge_id':  recharge_id,
            'service_name': service_name,
            'amount':       amount
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsRegularUser])
def recharge_history(request):
    person_id = request.user.person_id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT mr.mobile_recharge_id, mr.amount, mr.recharge_timestamp,
                   ts.service_name, ts.company_account
            FROM mobile_recharge mr
            JOIN telecom_service ts ON ts.service_id = mr.service_id
            JOIN wallet w ON w.wallet_id = mr.wallet_id
            WHERE w.person_id = %s
            ORDER BY mr.recharge_timestamp DESC
        """, [person_id])
        rows = cursor.fetchall()

    recharges = []
    for row in rows:
        recharges.append({
            'recharge_id':     row[0],
            'amount':          row[1],
            'timestamp':       row[2],
            'service_name':    row[3],
            'company_account': row[4]
        })

    return Response({'recharges': recharges}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsRegularUser])
def register_debit_card(request):
    person_id = request.user.person_id

    try:
        with connection.cursor() as cursor:
            cursor.execute("BEGIN")

          
            cursor.execute("""
                SELECT card_number FROM debit_cards
                WHERE person_user_id = %s
            """, [person_id])
            existing = cursor.fetchone()
            if existing:
                cursor.execute("ROLLBACK")
                return Response({'error': 'You already have a registered debit card'}, status=status.HTTP_400_BAD_REQUEST)

           
            while True:
                card_number = ''.join([str(random.randint(0, 9)) for _ in range(16)])
                cursor.execute("""
                    SELECT card_number FROM debit_cards
                    WHERE card_number = %s
                """, [card_number])
                if not cursor.fetchone():
                    break

          
            cvv             = ''.join([str(random.randint(0, 9)) for _ in range(3)])
            registered_date = date.today()
            expiry_date     = date(registered_date.year + 5, registered_date.month, registered_date.day)

            cursor.execute("""
                INSERT INTO debit_cards (card_number, person_user_id, cvv, registered_date, expiry_date)
                VALUES (%s, %s, %s, %s, %s)
            """, [card_number, person_id, cvv, registered_date, expiry_date])

            cursor.execute("COMMIT")

        return Response({
            'message':         'Debit card registered successfully',
            'card_number':     card_number,
            'cvv':             cvv,
            'registered_date': str(registered_date),
            'expiry_date':     str(expiry_date)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsRegularUser])
def my_debit_cards(request):
    person_id = request.user.person_id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT card_number, cvv, registered_date, expiry_date, card_fee
            FROM debit_cards
            WHERE person_user_id = %s
            ORDER BY registered_date DESC
        """, [person_id])
        rows = cursor.fetchall()

    cards = []
    for row in rows:
        cards.append({
            'card_number':     row[0],
            'cvv':             row[1],
            'registered_date': row[2],
            'expiry_date':     row[3],
            'card_fee':        row[4]
        })

    return Response({'debit_cards': cards}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAnyRole])
def get_notifications(request):
    person_id = request.user.person_id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT n.notification_id, n.notification_timestamp,
                   t.transaction_id, t.amount_sent, t.amount_received,
                   ps.name AS sender_name, pr.name AS receiver_name,
                   ws.wallet_account AS sender_account,
                   wr.wallet_account AS receiver_account
            FROM notification n
            JOIN transaction_notification tn ON tn.notification_id = n.notification_id
            JOIN "transaction" t ON t.transaction_id = tn.transaction_id
            JOIN wallet ws ON ws.wallet_id = t.sender_wallet_id
            JOIN wallet wr ON wr.wallet_id = t.receiver_wallet_id
            JOIN person ps ON ps.person_id = ws.person_id
            JOIN person pr ON pr.person_id = wr.person_id
            WHERE n.receiver_id = %s
            ORDER BY n.notification_timestamp DESC
        """, [person_id])
        rows = cursor.fetchall()

    notifications = []
    for row in rows:
        notifications.append({
            'notification_id':  row[0],
            'timestamp':        row[1],
            'transaction_id':   row[2],
            'amount_sent':      row[3],
            'amount_received':  row[4],
            'sender_name':      row[5],
            'receiver_name':    row[6],
            'sender_account':   row[7],
            'receiver_account': row[8]
        })

    return Response({'notifications': notifications}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsRegularUser])
def get_rank(request):
    person_id = request.user.person_id

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT r.rank_name, r.min_transaction, r.max_transaction,
                   r.min_amount, r.max_amount, rou.no_of_transaction
            FROM rank_of_users rou
            JOIN rank r ON r.rank_id = rou.rank_id
            WHERE rou.person_id = %s
        """, [person_id])
        row = cursor.fetchone()

    if not row:
        return Response({'error': 'Rank not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'rank_name':          row[0],
        'min_transaction':    row[1],
        'max_transaction':    row[2],
        'min_amount':         row[3],
        'max_amount':         row[4],
        'total_transactions': row[5]
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAnyRole])
def get_promotions(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT pr.promotion_id, m.name AS merchant_name,
                   pr.promotion_cost, pr.duration,
                   pr.promotional_advertisement,
                   pr.start_date,
                   pr.start_date + (pr.duration || ' days')::INTERVAL AS expiry_date
            FROM promotion pr
            JOIN merchant me ON me.merchant_person_id = pr.merchant_person_id
            JOIN person m ON m.person_id = me.merchant_person_id
            WHERE pr.start_date + (pr.duration || ' days')::INTERVAL > NOW()
            ORDER BY pr.promotion_id DESC
        """)
        rows = cursor.fetchall()

    promotions = []
    for row in rows:
        promotions.append({
            'promotion_id':              row[0],
            'merchant_name':             row[1],
            'promotion_cost':            row[2],
            'duration':                  row[3],
            'promotional_advertisement': row[4],
            'start_date':                row[5],
            'expiry_date':               row[6]
        })

    return Response({'promotions': promotions}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsMerchantUser])
def create_promotion(request):
    person_id                 = request.user.person_id
    promotion_cost            = request.data.get('promotion_cost')
    duration                  = request.data.get('duration')
    promotional_advertisement = request.data.get('promotional_advertisement')

    if not all([promotion_cost, duration, promotional_advertisement]):
        return Response({'error': 'All fields required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with connection.cursor() as cursor:
            cursor.execute("BEGIN")

            cursor.execute("SELECT admin_person_id FROM admin LIMIT 1")
            admin_row = cursor.fetchone()
            if not admin_row:
                cursor.execute("ROLLBACK")
                return Response({'error': 'No admin found'}, status=status.HTTP_404_NOT_FOUND)
            admin_person_id = admin_row[0]

            cursor.execute("""
                INSERT INTO promotion
                (merchant_person_id, admin_person_id, promotion_cost, duration, promotional_advertisement)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING promotion_id
            """, [person_id, admin_person_id, promotion_cost, duration, promotional_advertisement])
            promotion_id = cursor.fetchone()[0]

            cursor.execute("COMMIT")

        return Response({
            'message':      'Promotion created successfully',
            'promotion_id': promotion_id
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        with connection.cursor() as cursor:
            cursor.execute("ROLLBACK")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT p.person_id, p.name, p.email, p.phone_number,
                   p.cnic, p.person_type, w.wallet_account, w.current_amount
            FROM person p
            LEFT JOIN wallet w ON w.person_id = p.person_id
            ORDER BY p.person_id ASC
        """)
        rows = cursor.fetchall()

    users = []
    for row in rows:
        users.append({
            'person_id':      row[0],
            'name':           row[1],
            'email':          row[2],
            'phone_number':   row[3],
            'cnic':           row[4],
            'person_type':    row[5],
            'wallet_account': row[6],
            'current_amount': row[7]
        })

    return Response({'users': users}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_single_user(request, person_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT p.person_id, p.name, p.email, p.phone_number,
                   p.cnic, p.person_type, w.wallet_account, w.current_amount
            FROM person p
            LEFT JOIN wallet w ON w.person_id = p.person_id
            WHERE p.person_id = %s
        """, [person_id])
        row = cursor.fetchone()

    if not row:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'person_id':      row[0],
        'name':           row[1],
        'email':          row[2],
        'phone_number':   row[3],
        'cnic':           row[4],
        'person_type':    row[5],
        'wallet_account': row[6],
        'current_amount': row[7]
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_revenue(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT r.revenue_id, r.month, r.year, r.amount, p.name AS admin_name
            FROM revenue r
            JOIN admin a ON a.admin_person_id = r.admin_person_id
            JOIN person p ON p.person_id = a.admin_person_id
            ORDER BY r.year DESC, r.month DESC
        """)
        rows = cursor.fetchall()

    revenues = []
    for row in rows:
        revenues.append({
            'revenue_id': row[0],
            'month':      row[1],
            'year':       row[2],
            'amount':     row[3],
            'admin_name': row[4]
        })

    return Response({'revenues': revenues}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_merchants(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT p.person_id, p.name, p.email, p.phone_number,
                   w.wallet_account, w.current_amount
            FROM merchant m
            JOIN person p ON p.person_id = m.merchant_person_id
            LEFT JOIN wallet w ON w.person_id = p.person_id
            ORDER BY p.person_id ASC
        """)
        rows = cursor.fetchall()

    merchants = []
    for row in rows:
        merchants.append({
            'person_id':      row[0],
            'name':           row[1],
            'email':          row[2],
            'phone_number':   row[3],
            'wallet_account': row[4],
            'current_amount': row[5]
        })

    return Response({'merchants': merchants}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_bill_payments(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT bp.bill_payment_id, bp.amount, bp.consumer_account_no,
                   p.name, w.wallet_account
            FROM bill_payment bp
            JOIN wallet w ON w.wallet_id = bp.wallet_id
            JOIN person p ON p.person_id = w.person_id
            ORDER BY bp.bill_payment_id DESC
        """)
        rows = cursor.fetchall()

    payments = []
    for row in rows:
        payments.append({
            'bill_payment_id':  row[0],
            'amount':           row[1],
            'consumer_account': row[2],
            'person_name':      row[3],
            'wallet_account':   row[4]
        })

    return Response({'bill_payments': payments}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_recharges(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT mr.mobile_recharge_id, mr.amount, mr.recharge_timestamp,
                   ts.service_name, p.name, w.wallet_account
            FROM mobile_recharge mr
            JOIN telecom_service ts ON ts.service_id = mr.service_id
            JOIN wallet w ON w.wallet_id = mr.wallet_id
            JOIN person p ON p.person_id = w.person_id
            ORDER BY mr.recharge_timestamp DESC
        """)
        rows = cursor.fetchall()

    recharges = []
    for row in rows:
        recharges.append({
            'recharge_id':    row[0],
            'amount':         row[1],
            'timestamp':      row[2],
            'service_name':   row[3],
            'person_name':    row[4],
            'wallet_account': row[5]
        })

    return Response({'recharges': recharges}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAnyRole])
def logout(request):
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)