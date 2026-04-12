import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminTransactions = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    fetchMine();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await api.get('/transactions/');
      const data = res.data;
      if (Array.isArray(data)) {
        setAllTransactions(data);
      } else if (data.transactions) {
        setAllTransactions(data.transactions);
      } else {
        setAllTransactions([]);
      }
    } catch (err) {
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMine = async () => {
    try {
      const res = await api.get('/transactions/received/');
      const data = res.data;
      if (Array.isArray(data)) {
        setMyTransactions(data);
      } else if (data.received_transactions) {
        setMyTransactions(data.received_transactions);
      } else {
        setMyTransactions([]);
      }
    } catch (err) {
      setMyTransactions([]);
    }
  };

  const transactions = activeTab === 'all' ? allTransactions : myTransactions;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Transactions 📋
        </h1>
        <p style={{ color: '#888', margin: 0 }}>View all transactions in the system</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 25px',
            background: activeTab === 'all'
              ? 'linear-gradient(135deg, #00d4aa, #007bff)'
              : '#fff',
            border: activeTab === 'all' ? 'none' : '2px solid #f0f2f5',
            borderRadius: '12px',
            color: activeTab === 'all' ? '#fff' : '#666',
            fontSize: '14px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📋 All System Transactions
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          style={{
            padding: '10px 25px',
            background: activeTab === 'mine'
              ? 'linear-gradient(135deg, #00d4aa, #007bff)'
              : '#fff',
            border: activeTab === 'mine' ? 'none' : '2px solid #f0f2f5',
            borderRadius: '12px',
            color: activeTab === 'mine' ? '#fff' : '#666',
            fontSize: '14px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          💰 My Received Transactions
        </button>
      </div>

      {/* Stats */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '20px', padding: '20px 30px',
        marginBottom: '25px', color: '#fff',
        display: 'flex', gap: '40px',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 5px', textTransform: 'uppercase' }}>
            {activeTab === 'all' ? 'Total Transactions' : 'Received Transactions'}
          </p>
          <h2 style={{ color: '#00d4aa', fontSize: '28px', fontWeight: '800', margin: 0 }}>
            {transactions.length}
          </h2>
        </div>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 5px', textTransform: 'uppercase' }}>
            Total Amount
          </p>
          <h2 style={{ color: '#00d4aa', fontSize: '28px', fontWeight: '800', margin: 0 }}>
            Rs {transactions.reduce((sum, tx) => sum + Number(activeTab === 'all' ? tx.amount_sent : tx.amount_received || 0), 0).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            No transactions found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map((tx, index) => (
              <div key={index} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '18px 20px',
                background: '#f8f9fa', borderRadius: '14px',
                border: '1px solid #f0f2f5',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '48px', height: '48px',
                    background: activeTab === 'all'
                      ? 'rgba(0,123,255,0.1)'
                      : 'rgba(0,212,170,0.1)',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px',
                  }}>
                    {activeTab === 'all' ? '📋' : '📥'}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>
                      {activeTab === 'all'
                        ? `${tx.sender_name} → ${tx.receiver_name}`
                        : `From: ${tx.sender_name}`}
                    </p>
                    <p style={{ margin: '3px 0 0', color: '#888', fontSize: '12px' }}>
                      {activeTab === 'all'
                        ? `${tx.sender_account} → ${tx.receiver_account}`
                        : `Account: ${tx.sender_account}`}
                    </p>
                    <p style={{ margin: '2px 0 0', color: '#aaa', fontSize: '11px' }}>
                      {tx.timestamp_sender
                        ? new Date(tx.timestamp_sender).toLocaleString()
                        : ''}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    margin: 0, fontWeight: '800', fontSize: '18px',
                    color: activeTab === 'all' ? '#007bff' : '#00d4aa',
                  }}>
                    Rs {Number(activeTab === 'all'
                      ? tx.amount_sent
                      : tx.amount_received || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;