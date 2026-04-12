import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [rank, setRank] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const walletRes = await api.get('/wallet/');
        setWallet(walletRes.data);

        let txList = [];
        if (user?.person_type === 'admin') {
          const txRes = await api.get('/transactions/received/');
          const txData = txRes.data;
          txList = Array.isArray(txData)
            ? txData
            : (txData.received_transactions || txData.results || []);
        } else {
          const txRes = await api.get('/transactions/');
          const txData = txRes.data;
          txList = Array.isArray(txData)
            ? txData
            : (txData.transactions || txData.results || []);
        }
        setTransactions(txList.slice(0, 5));

        const notifRes = await api.get('/notifications/');
        const notifData = notifRes.data;
        const notifList = Array.isArray(notifData)
          ? notifData
          : (notifData.notifications || notifData.results || []);
        setNotifications(notifList);

        if (user?.person_type === 'user') {
          const rankRes = await api.get('/rank/');
          setRank(rankRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const rankColors = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#00d4aa',
    Diamond: '#007bff',
  };

  const isSent = (tx) => tx.sender_name === user?.name;

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      color: '#00d4aa', fontSize: '18px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      Loading...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#888', margin: 0, fontSize: '15px' }}>
          Here is your financial overview
        </p>
      </div>

      {/* Top Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}>
        {/* Wallet Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a2f5e 100%)',
          borderRadius: '20px', padding: '30px',
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(10,22,40,0.3)',
        }}>
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px',
            background: 'rgba(0,212,170,0.1)', borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', right: '40px',
            width: '80px', height: '80px',
            background: 'rgba(0,123,255,0.1)', borderRadius: '50%',
          }} />
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '13px',
            margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Wallet Balance
          </p>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 5px', color: '#00d4aa' }}>
            Rs {wallet?.current_amount?.toLocaleString() || '0'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
            Account: {wallet?.wallet_account}
          </p>
        </div>

        {/* Rank Card - User only */}
        {user?.person_type === 'user' && rank && (
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '30px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            border: `2px solid ${rankColors[rank.rank_name] || '#00d4aa'}20`,
          }}>
            <p style={{
              color: '#888', fontSize: '13px',
              margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              Current Rank
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{
                width: '55px', height: '55px',
                background: `${rankColors[rank.rank_name]}20`,
                borderRadius: '15px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '28px',
              }}>
                🏅
              </div>
              <div>
                <h3 style={{
                  margin: 0, fontSize: '24px', fontWeight: '700',
                  color: rankColors[rank.rank_name],
                }}>
                  {rank.rank_name}
                </h3>
                <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
                  {rank.total_transactions} transactions
                </p>
              </div>
            </div>
            <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '10px 15px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                Max transfer: <strong style={{ color: rankColors[rank.rank_name] }}>
                  Rs {rank.max_amount?.toLocaleString()}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats Card */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '30px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        }}>
          <p style={{
            color: '#888', fontSize: '13px',
            margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Quick Stats
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>
                {user?.person_type === 'admin' ? 'Received Transactions' : 'Recent Transactions'}
              </span>
              <span style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '18px' }}>
                {transactions.length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Notifications</span>
              <span style={{ fontWeight: '700', color: '#007bff', fontSize: '18px' }}>
                {notifications.length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Role</span>
              <span style={{
                fontWeight: '700', fontSize: '13px',
                background: 'linear-gradient(135deg, #00d4aa, #007bff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'capitalize',
              }}>
                {user?.person_type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.person_type !== 'admin' && (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '25px 30px', marginBottom: '30px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ color: '#1a1a2e', fontSize: '16px', fontWeight: '700', margin: '0 0 20px' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {[
              { label: 'Send Money', icon: '💸', path: '/transfer', color: '#00d4aa' },
              ...(user?.person_type === 'user' ? [
                { label: 'Pay Bill', icon: '📄', path: '/bill-payment', color: '#007bff' },
                { label: 'Recharge', icon: '📱', path: '/recharge', color: '#f39c12' },
                { label: 'Debit Card', icon: '💳', path: '/debit-card', color: '#9b59b6' },
              ] : []),
              ...(user?.person_type === 'merchant' ? [
                { label: 'Create Promo', icon: '📢', path: '/promotions', color: '#e74c3c' },
              ] : []),
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px',
                  background: `${action.color}15`,
                  border: `1px solid ${action.color}30`,
                  borderRadius: '12px', color: action.color,
                  fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent / Received Transactions */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px',
        }}>
          <h3 style={{ color: '#1a1a2e', fontSize: '16px', fontWeight: '700', margin: 0 }}>
            {user?.person_type === 'admin' ? 'Received Transactions' : 'Recent Transactions'}
          </h3>
          <button
            onClick={() => navigate(user?.person_type === 'admin' ? '/admin/transactions' : '/transactions')}
            style={{
              background: 'none', border: 'none',
              color: '#007bff', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
            }}
          >
            View All →
          </button>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
            No transactions yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx, index) => {
              const sent = user?.person_type !== 'admin' && isSent(tx);
              const amount = user?.person_type === 'admin'
                ? Number(tx.amount_received || 0)
                : sent
                  ? Number(tx.amount_sent || 0)
                  : Number(tx.amount_received || 0);
              const timestamp = sent
                ? tx.timestamp_sender
                : tx.timestamp_receiver;

              return (
                <div key={index} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '15px',
                  background: '#f8f9fa', borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: sent
                        ? 'rgba(255,71,87,0.1)'
                        : 'rgba(0,212,170,0.1)',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '18px',
                    }}>
                      {sent ? '📤' : '📥'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>
                        {user?.person_type === 'admin'
                          ? `From: ${tx.sender_name}`
                          : sent
                            ? `To: ${tx.receiver_name}`
                            : `From: ${tx.sender_name}`}
                      </p>
                      <p style={{ margin: 0, color: '#aaa', fontSize: '12px' }}>
                        {timestamp ? new Date(timestamp).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontWeight: '700', fontSize: '15px',
                    color: sent ? '#ff4757' : '#00d4aa',
                  }}>
                    {sent ? '-' : '+'}Rs {amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;