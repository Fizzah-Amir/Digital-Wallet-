import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/wallets/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setWallets(data);
      } else if (data.wallets) {
        setWallets(data.wallets);
      } else if (data.results) {
        setWallets(data.results);
      } else {
        setWallets([]);
      }
    }).catch(() => setWallets([]))
    .finally(() => setLoading(false));
  }, []);
  const filtered = Array.isArray(wallets) ? wallets.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.wallet_account?.includes(search)
  ) : [];
 const totalBalance = Array.isArray(wallets) ? wallets.reduce((sum, w) => sum + (w.current_amount || 0), 0) : 0;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          All Wallets 💰
        </h1>
        <p style={{ color: '#888', margin: 0 }}>{wallets.length} wallets in system</p>
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '20px', padding: '25px 30px',
        marginBottom: '25px', color: '#fff',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Total System Balance
        </p>
        <h2 style={{ color: '#00d4aa', fontSize: '36px', fontWeight: '800', margin: 0 }}>
          Rs {totalBalance?.toLocaleString()}
        </h2>
      </div>
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or wallet account..."
          style={{
            width: '100%', maxWidth: '400px',
            padding: '13px 16px',
            border: '2px solid #f0f2f5', borderRadius: '12px',
            fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
                  {['Name', 'Role', 'Wallet Account', 'Balance'].map(h => (
                    <th key={h} style={{
                      padding: '12px 15px', textAlign: 'left',
                      color: '#666', fontSize: '12px',
                      fontWeight: '700', textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          background: 'linear-gradient(135deg, #00d4aa, #007bff)',
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff', fontWeight: '700', fontSize: '14px',
                        }}>
                          {w.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>
                          {w.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: w.person_type === 'admin' ? 'rgba(255,71,87,0.1)' : w.person_type === 'merchant' ? 'rgba(0,123,255,0.1)' : 'rgba(0,212,170,0.1)',
                        color: w.person_type === 'admin' ? '#ff4757' : w.person_type === 'merchant' ? '#007bff' : '#00d4aa',
                        fontSize: '12px', fontWeight: '700',
                        padding: '4px 10px', borderRadius: '20px',
                        textTransform: 'capitalize',
                      }}>
                        {w.person_type}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '13px', fontFamily: 'monospace' }}>
                      {w.wallet_account}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: '700', color: '#00d4aa', fontSize: '14px' }}>
                        Rs {w.current_amount?.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWallets;