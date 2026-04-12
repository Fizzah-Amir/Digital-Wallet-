import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/merchants/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setMerchants(data);
      } else if (data.merchants) {
        setMerchants(data.merchants);
      } else if (data.results) {
        setMerchants(data.results);
      } else {
        setMerchants([]);
      }
    }).catch(() => setMerchants([]))
    .finally(() => setLoading(false));
  }, []);

  const filtered = Array.isArray(merchants) ? merchants.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          All Merchants 🏪
        </h1>
        <p style={{ color: '#888', margin: 0 }}>{merchants.length} registered merchants</p>
      </div>
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search merchants..."
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
                  {['Name', 'Email', 'Phone', 'Wallet Balance'].map(h => (
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
                {filtered.map((m, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px',
                          background: 'linear-gradient(135deg, #007bff, #00d4aa)',
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff', fontWeight: '700', fontSize: '14px',
                        }}>
                          {m.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>
                          {m.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '13px' }}>{m.email}</td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '13px' }}>{m.phone_number}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: '700', color: '#00d4aa', fontSize: '14px' }}>
                        Rs {m.current_amount?.toLocaleString()}
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

export default AdminMerchants;