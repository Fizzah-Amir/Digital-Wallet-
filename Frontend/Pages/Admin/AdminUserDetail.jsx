import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminUserDetail = () => {
  const { person_id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${person_id}/`).then(res => {
      setUser(res.data);
    }).finally(() => setLoading(false));
  }, [person_id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa', fontFamily: "'Segoe UI', sans-serif" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '700px' }}>
      <button
        onClick={() => navigate('/admin/users')}
        style={{
          background: 'none', border: 'none',
          color: '#007bff', fontSize: '14px',
          fontWeight: '600', cursor: 'pointer',
          marginBottom: '20px', padding: 0,
        }}
      >
        ← Back to Users
      </button>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          User Details
        </h1>
      </div>
      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '24px', padding: '35px',
        marginBottom: '25px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: '25px',
      }}>
        <div style={{
          width: '70px', height: '70px',
          background: 'linear-gradient(135deg, #00d4aa, #007bff)',
          borderRadius: '20px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px', fontWeight: '800',
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', margin: '0 0 5px' }}>
            {user?.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '14px' }}>
            {user?.email}
          </p>
        </div>
      </div>
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[
            { label: 'Person ID', value: `#${user?.person_id}` },
            { label: 'Phone Number', value: user?.phone_number },
            { label: 'CNIC', value: user?.cnic },
            { label: 'Date of Birth', value: user?.date_of_birth },
            { label: 'Gender', value: user?.gender },
            { label: 'Wallet Account', value: user?.wallet_account },
            { label: 'Wallet Balance', value: `Rs ${user?.current_amount?.toLocaleString()}` },
            { label: 'Rank', value: user?.rank },
            { label: 'Total Transactions', value: user?.total_transactions },
          ].map((item) => item.value && (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '14px 18px',
              background: '#f8f9fa', borderRadius: '12px',
            }}>
              <span style={{ color: '#666', fontSize: '14px' }}>{item.label}</span>
              <span style={{ color: '#1a1a2e', fontWeight: '700', fontSize: '14px' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;