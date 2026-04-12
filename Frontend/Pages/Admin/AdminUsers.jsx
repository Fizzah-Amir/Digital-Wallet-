import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/users/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.users) {
        setUsers(data.users);
      } else if (data.results) {
        setUsers(data.results);
      } else {
        setUsers([]);
      }
    }).catch(() => setUsers([]))
    .finally(() => setLoading(false));
  }, []);

  const filtered = Array.isArray(users) ? users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          All Users 👥
        </h1>
        <p style={{ color: '#888', margin: 0 }}>{users.length} registered users</p>
      </div>
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{
            width: '100%', maxWidth: '400px',
            padding: '13px 16px',
            border: '2px solid #f0f2f5', borderRadius: '12px',
            fontSize: '14px', outline: 'none',
            boxSizing: 'border-box', color: '#1a1a2e',
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
                  {['Name', 'Email', 'Phone', 'Wallet Balance', 'Rank', 'Actions'].map(h => (
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
                {filtered.map((u, index) => (
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
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '13px' }}>{u.email}</td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '13px' }}>{u.phone_number}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: '700', color: '#00d4aa', fontSize: '14px' }}>
                        Rs {u.current_amount?.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: 'rgba(0,212,170,0.1)',
                        color: '#00d4aa', fontSize: '12px',
                        fontWeight: '700', padding: '4px 10px',
                        borderRadius: '20px',
                      }}>
                        {u.rank}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <button
                        onClick={() => navigate(`/admin/users/${u.person_id}`)}
                        style={{
                          padding: '7px 15px',
                          background: 'rgba(0,123,255,0.1)',
                          border: 'none', borderRadius: '8px',
                          color: '#007bff', fontSize: '12px',
                          fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
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

export default AdminUsers;