import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminRecharges = () => {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/recharges/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setRecharges(data);
      } else if (data.recharges) {
        setRecharges(data.recharges);
      } else if (data.results) {
        setRecharges(data.results);
      } else {
        setRecharges([]);
      }
    }).catch(() => setRecharges([]))
    .finally(() => setLoading(false));
  }, []);

 const total = Array.isArray(recharges) ? recharges.reduce((sum, r) => sum + (r.amount || 0), 0) : 0;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          All Recharges 📱
        </h1>
        <p style={{ color: '#888', margin: 0 }}>{recharges.length} total recharges</p>
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '20px', padding: '25px 30px',
        marginBottom: '25px', color: '#fff',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Total Recharge Amount
        </p>
        <h2 style={{ color: '#00d4aa', fontSize: '36px', fontWeight: '800', margin: 0 }}>
          Rs {total?.toLocaleString()}
        </h2>
      </div>
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>Loading...</div>
        ) : recharges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No recharges yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
                  {['User', 'Service', 'Amount', 'Date'].map(h => (
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
                {recharges.map((r, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>{r.person_name}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: 'rgba(243,156,18,0.1)',
                        color: '#f39c12', fontSize: '12px',
                        fontWeight: '700', padding: '4px 10px',
                        borderRadius: '20px',
                      }}>
                        {r.service_name}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: '700', color: '#ff4757', fontSize: '14px' }}>
                        Rs {r.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#aaa', fontSize: '13px' }}>
                      {new Date(r.timestamp).toLocaleString()}
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

export default AdminRecharges;