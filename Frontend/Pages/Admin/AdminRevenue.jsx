import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminRevenue = () => {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/revenue/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setRevenue(data);
      } else if (data.revenues) {
        setRevenue(data.revenues);
      } else if (data.revenue) {
        setRevenue(data.revenue);
      } else if (data.results) {
        setRevenue(data.results);
      } else {
        setRevenue([]);
      }
    }).catch(() => setRevenue([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = Array.isArray(revenue)
    ? revenue.reduce((sum, r) => sum + (r.amount || 0), 0)
    : 0;

  const chartData = revenue.map(r => ({
    name: `${r.month}/${r.year}`,
    amount: r.amount,
  }));

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Revenue Report 📊
        </h1>
        <p style={{ color: '#888', margin: 0 }}>Income from debit card fees and promotions</p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '20px', padding: '25px 30px',
        marginBottom: '25px', color: '#fff',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Total Revenue
        </p>
        <h2 style={{ color: '#00d4aa', fontSize: '36px', fontWeight: '800', margin: 0 }}>
          Rs {totalRevenue?.toLocaleString()}
        </h2>
      </div>

      {/* Bar Chart */}
      {!loading && revenue.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
          marginBottom: '25px',
        }}>
          <h3 style={{ color: '#1a1a2e', fontSize: '16px', fontWeight: '700', margin: '0 0 20px' }}>
            Revenue by Month
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip
                formatter={(value) => [`Rs ${value?.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" fill="#00d4aa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue List */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>Loading...</div>
        ) : revenue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No revenue data yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {revenue.map((r, index) => (
              <div key={index} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '18px 20px',
                background: '#f8f9fa', borderRadius: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '48px', height: '48px',
                    background: 'rgba(0,212,170,0.1)',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px',
                  }}>
                    📊
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>
                      {r.month} / {r.year}
                    </p>
                    <p style={{ margin: '3px 0 0', color: '#aaa', fontSize: '12px' }}>
                      {r.admin_name}
                    </p>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: '#00d4aa' }}>
                  Rs {r.amount?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenue;