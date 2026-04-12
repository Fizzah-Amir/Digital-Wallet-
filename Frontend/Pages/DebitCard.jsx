import { useState, useEffect } from 'react';
import api from '../api/axios';

const DebitCard = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wallet, setWallet] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCard();
    api.get('/wallet/').then(res => setWallet(res.data));
  }, []);

  const fetchCard = async () => {
    try {
      const res = await api.get('/debit-card/my-cards/');
      const data = res.data;
      let cards = [];
      if (Array.isArray(data)) {
        cards = data;
      } else if (data.cards) {
        cards = data.cards;
      } else if (data.debit_cards) {
        cards = data.debit_cards;
      }
      setCard(cards.length > 0 ? cards[0] : null);
    } catch (err) {
      console.error(err);
      setCard(null);
    } finally {
      setFetching(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/debit-card/register/');
      setSuccess('Debit card registered successfully!');
      fetchCard();
      const walletRes = await api.get('/wallet/');
      setWallet(walletRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (number) => {
    return number?.toString().replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Debit Card 💳
        </h1>
        <p style={{ color: '#888', margin: 0 }}>Manage your debit card</p>
      </div>

      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '20px', padding: '25px 30px',
        marginBottom: '25px', color: '#fff',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Available Balance
        </p>
        <h2 style={{ color: '#00d4aa', fontSize: '32px', fontWeight: '800', margin: 0 }}>
          Rs {wallet?.current_amount?.toLocaleString() || '0'}
        </h2>
      </div>

      {/* Error / Success */}
      {error && (
        <div style={{
          background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
          borderRadius: '10px', padding: '12px 15px', color: '#ff4757',
          fontSize: '13px', marginBottom: '20px',
        }}>
          ❌ {error}
        </div>
      )}
      {success && (
        <div style={{
          background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)',
          borderRadius: '10px', padding: '12px 15px', color: '#00d4aa',
          fontSize: '13px', marginBottom: '20px',
        }}>
          ✅ {success}
        </div>
      )}

      {fetching ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>
          Loading...
        </div>
      ) : !card ? (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '40px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>💳</div>
          <h3 style={{ color: '#1a1a2e', margin: '0 0 10px' }}>No Debit Card Yet</h3>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '25px' }}>
            Register a debit card to make payments anywhere. Card fee will be deducted from your wallet.
          </p>
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              padding: '14px 35px',
              background: loading
                ? 'rgba(0,212,170,0.5)'
                : 'linear-gradient(135deg, #00d4aa, #007bff)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontSize: '16px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 5px 20px rgba(0,212,170,0.3)',
            }}
          >
            {loading ? 'Registering...' : 'Register Debit Card 💳'}
          </button>
        </div>
      ) : (
        <div>
          {/* Single Card Display */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #2d3561 50%, #1a1a2e 100%)',
            borderRadius: '20px', padding: '30px',
            marginBottom: '20px', color: '#fff',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '150px', height: '150px',
              background: 'rgba(0,212,170,0.1)',
              borderRadius: '50%',
            }} />
            <div style={{
              position: 'absolute', bottom: '-40px', left: '30px',
              width: '120px', height: '120px',
              background: 'rgba(0,123,255,0.1)',
              borderRadius: '50%',
            }} />

            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#00d4aa' }}>
                EasyWallet
              </div>
              <div style={{ fontSize: '30px' }}>💳</div>
            </div>

            {/* Card Number */}
            <div style={{ marginBottom: '25px' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 5px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Card Number
              </p>
              <p style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: 0, letterSpacing: '3px' }}>
                {formatCardNumber(card.card_number)}
              </p>
            </div>

            {/* Card Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 3px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Registered
                </p>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  {new Date(card.registered_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 3px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Expires
                </p>
                <p style={{ color: '#00d4aa', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  {new Date(card.expiry_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 3px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  CVV
                </p>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  ***
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '20px 25px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
          }}>
            <p style={{ color: '#666', fontSize: '13px', margin: 0, textAlign: 'center' }}>
              ✅ You already have a registered debit card. Only one card is allowed per account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebitCard;