import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminBillPayments = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/bill-payments/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setBills(data);
      } else if (data.bill_payments) {
        setBills(data.bill_payments);
      } else if (data.results) {
        setBills(data.results);
      } else {
        setBills([]);
      }
    }).catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, []);

  const total = Array.isArray(bills) ? bills.reduce((sum, b) => sum + (b.amount || 0), 0) : 0;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          All Bill Payments 📄
        </h1>
        <p style={{ color: '#888', margin: 0 }}>{bills.length} total bill payments</p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '20px', padding: '25px 30px',
        marginBottom: '25px', color: '#fff',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Total Amount Paid
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
        ) : bills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No bill payments yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
                  {['User', 'Consumer Account', 'Amount'].map(h => (
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
                {bills.map((b, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>{b.name}</td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '13px' }}>{b.consumer_account_no}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: '700', color: '#ff4757', fontSize: '14px' }}>
                        Rs {b.amount?.toLocaleString()}
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

export default AdminBillPayments;
