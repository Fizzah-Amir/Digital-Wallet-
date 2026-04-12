import { useState, useEffect } from 'react';
import api from '../api/axios';

const BillPayment = () => {
  const [consumerAccount, setConsumerAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState('pay');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/bill-payment/history/');
      const data = res.data;
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data.history) {
        setHistory(data.history);
      } else if (data.results) {
        setHistory(data.results);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    api.get('/wallet/').then(res => setWallet(res.data));
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/bill-payment/', {
        consumer_account_no: consumerAccount,
        amount: parseFloat(amount),
      });
      setSuccess('Bill paid successfully!');
      setConsumerAccount('');
      setAmount('');
      const walletRes = await api.get('/wallet/');
      setWallet(walletRes.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Bill payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Bill Payment 📄
        </h1>
        <p style={{ color: '#888', margin: 0 }}>Pay your utility bills easily</p>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {['pay', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 25px',
              background: activeTab === tab
                ? 'linear-gradient(135deg, #00d4aa, #007bff)'
                : '#fff',
              border: activeTab === tab ? 'none' : '2px solid #f0f2f5',
              borderRadius: '12px',
              color: activeTab === tab ? '#fff' : '#666',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'pay' ? '📄 Pay Bill' : '📋 History'}
          </button>
        ))}
      </div>

      {activeTab === 'pay' ? (
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

          {/* Bill Type Icons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
            {[
              { icon: '💡', label: 'Electricity' },
              { icon: '💧', label: 'Water' },
              { icon: '🔥', label: 'Gas' },
              { icon: '📡', label: 'Internet' },
            ].map((bill) => (
              <div key={bill.label} style={{
                flex: 1, padding: '15px 10px',
                background: '#f8f9fa', borderRadius: '14px',
                textAlign: 'center', cursor: 'pointer',
                border: '2px solid #f0f2f5',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>{bill.icon}</div>
                <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>{bill.label}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                color: '#666', fontSize: '13px', fontWeight: '600',
                display: 'block', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                Consumer Account Number
              </label>
              <input
                type="text"
                value={consumerAccount}
                onChange={(e) => setConsumerAccount(e.target.value)}
                placeholder="Enter consumer account number"
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
              {loading ? 'Processing...' : 'Pay Bill 📄'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
              No bill payments yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((bill, index) => (
                <div key={index} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '18px 20px',
                  background: '#f8f9fa', borderRadius: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      background: 'rgba(0,123,255,0.1)',
                      borderRadius: '14px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '22px',
                    }}>
                      📄
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>
                        Account: {bill.consumer_account_no}
                      </p>
                      <p style={{ margin: '3px 0 0', color: '#aaa', fontSize: '12px' }}>
                        {new Date(bill.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: '#ff4757' }}>
                    -Rs {bill.amount?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillPayment;