import { useState, useEffect } from 'react';
import api from '../api/axios';

const Transfer = () => {
  const [receiverWallet, setReceiverWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    api.get('/wallet/').then(res => setWallet(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/transfer/', {
        receiver_wallet_account: receiverWallet,
        amount: parseFloat(amount),
      });
      setSuccess(`Transfer successful! Transaction ID: ${res.data.transaction_id}`);
      setReceiverWallet('');
      setAmount('');
      const walletRes = await api.get('/wallet/');
      setWallet(walletRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '600px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Send Money 💸
        </h1>
        <p style={{ color: '#888', margin: 0 }}>Transfer money to any wallet</p>
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
        <h2 style={{ color: '#00d4aa', fontSize: '32px', fontWeight: '800', margin: '0 0 5px' }}>
          Rs {wallet?.current_amount?.toLocaleString() || '0'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
          {wallet?.wallet_account}
        </p>
      </div>

      {/* Form */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              color: '#666', fontSize: '13px', fontWeight: '600',
              display: 'block', marginBottom: '8px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Receiver Wallet Account
            </label>
            <input
              type="text"
              value={receiverWallet}
              onChange={(e) => setReceiverWallet(e.target.value)}
              placeholder="Enter 16 digit wallet account number"
              required
              style={{
                width: '100%', padding: '14px 16px',
                border: '2px solid #f0f2f5', borderRadius: '12px',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', color: '#1a1a2e',
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              color: '#666', fontSize: '13px', fontWeight: '600',
              display: 'block', marginBottom: '8px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Amount (Rs)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              min="1"
              style={{
                width: '100%', padding: '14px 16px',
                border: '2px solid #f0f2f5', borderRadius: '12px',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', color: '#1a1a2e',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? 'rgba(0,212,170,0.5)' : 'linear-gradient(135deg, #00d4aa, #007bff)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontSize: '16px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 5px 20px rgba(0,212,170,0.3)',
            }}
          >
            {loading ? 'Processing...' : 'Send Money 💸'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Transfer;