import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions('all');
  }, []);

  const fetchTransactions = async (type) => {
    setLoading(true);
    try {
      let url = '/transactions/';
      if (type === 'sent') url = '/transactions/sent/';
      if (type === 'received') url = '/transactions/received/';
      const res = await api.get(url);
      const data = res.data;
      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (type === 'sent' && data.sent_transactions) {
        setTransactions(data.sent_transactions);
      } else if (type === 'received' && data.received_transactions) {
        setTransactions(data.received_transactions);
      } else if (data.transactions) {
        setTransactions(data.transactions);
      } else if (data.results) {
        setTransactions(data.results);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (type) => {
    setFilter(type);
    fetchTransactions(type);
  };

  const isSent = (tx) => {
    if (filter === 'sent') return true;
    if (filter === 'received') return false;
    return tx.sender_name === user?.name ||
           tx.sender_account === user?.wallet_account;
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Transactions 📋
        </h1>
        <p style={{ color: '#888', margin: 0 }}>View all your transaction history</p>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {['all', 'sent', 'received'].map((type) => (
          <button
            key={type}
            onClick={() => handleFilter(type)}
            style={{
              padding: '10px 25px',
              background: filter === type
                ? 'linear-gradient(135deg, #00d4aa, #007bff)'
                : '#fff',
              border: filter === type ? 'none' : '2px solid #f0f2f5',
              borderRadius: '12px',
              color: filter === type ? '#fff' : '#666',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', textTransform: 'capitalize',
              boxShadow: filter === type ? '0 5px 15px rgba(0,212,170,0.3)' : 'none',
            }}
          >
            {type === 'all' ? '📋 All' : type === 'sent' ? '📤 Sent' : '📥 Received'}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            No transactions found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx, index) => {
              const sent = filter === 'sent' || (filter === 'all' && isSent(tx));
              const amount = sent
                ? parseFloat(tx.amount_sent || 0)
                : parseFloat(tx.amount_received || 0);
              const timestamp = sent
                ? tx.timestamp_sender
                : tx.timestamp_receiver;

              return (
                <div key={index} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '18px 20px',
                  background: '#f8f9fa', borderRadius: '14px',
                  border: '1px solid #f0f2f5',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      background: sent
                        ? 'rgba(255,71,87,0.1)'
                        : 'rgba(0,212,170,0.1)',
                      borderRadius: '14px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '22px',
                    }}>
                      {sent ? '📤' : '📥'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>
                        {sent
                          ? `To: ${tx.receiver_name}`
                          : `From: ${tx.sender_name}`}
                      </p>
                      <p style={{ margin: '3px 0 0', color: '#888', fontSize: '12px' }}>
                        {sent
                          ? `Account: ${tx.receiver_account}`
                          : `Account: ${tx.sender_account}`}
                      </p>
                      <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: '11px' }}>
                        {timestamp ? new Date(timestamp).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      margin: 0, fontWeight: '800', fontSize: '18px',
                      color: sent ? '#ff4757' : '#00d4aa',
                    }}>
                      {sent ? '-' : '+'}Rs {amount.toLocaleString()}
                    </p>
                    <span style={{
                      fontSize: '11px', fontWeight: '600',
                      padding: '3px 10px', borderRadius: '20px',
                      background: sent
                        ? 'rgba(255,71,87,0.1)'
                        : 'rgba(0,212,170,0.1)',
                      color: sent ? '#ff4757' : '#00d4aa',
                    }}>
                      {sent ? 'sent' : 'received'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;