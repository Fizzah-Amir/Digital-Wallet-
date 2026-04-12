import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', phone_number: '' });
  const [activeTab, setActiveTab] = useState('view');

  useEffect(() => {
    api.get('/profile/').then(res => {
      setProfile(res.data);
      setForm({
        name: res.data.name,
        phone_number: res.data.phone_number,
      });
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      await api.put('/profile/update/', form);
      setSuccess('Profile updated successfully!');
      const res = await api.get('/profile/');
      setProfile(res.data);
      setActiveTab('view');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const roleColors = {
    user: '#00d4aa',
    merchant: '#007bff',
    admin: '#ff4757',
  };

  const roleEmojis = {
    user: '👤',
    merchant: '🏪',
    admin: '🔑',
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa', fontFamily: "'Segoe UI', sans-serif" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          My Profile 👤
        </h1>
        <p style={{ color: '#888', margin: 0 }}>View and manage your profile</p>
      </div>

      {/* Profile Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '24px', padding: '35px',
        marginBottom: '25px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: '25px',
      }}>
        <div style={{
          width: '80px', height: '80px', minWidth: '80px',
          background: 'linear-gradient(135deg, #00d4aa, #007bff)',
          borderRadius: '24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px', fontWeight: '800', color: '#fff',
        }}>
          {profile?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: '0 0 5px' }}>
            {profile?.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 10px' }}>
            {profile?.email}
          </p>
          <span style={{
            background: `${roleColors[user?.person_type]}22`,
            border: `1px solid ${roleColors[user?.person_type]}`,
            color: roleColors[user?.person_type],
            fontSize: '12px', fontWeight: '700',
            padding: '4px 14px', borderRadius: '20px',
            textTransform: 'capitalize',
          }}>
            {roleEmojis[user?.person_type]} {user?.person_type}
          </span>
        </div>
        
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {['view', 'edit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 25px',
              background: activeTab === tab
                ? 'linear-gradient(135deg, #00d4aa, #007bff)'
                : '#fff',
              border: activeTab === tab ? 'none' : '2px solid #f0f2f5',
              borderRadius: '12px',
              color: activeTab === tab ? '#fff' : '#666',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'view' ? '👁 View Profile' : '✏️ Edit Profile'}
          </button>
        ))}
      </div>

      {activeTab === 'view' ? (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Full Name', value: profile?.name, icon: '👤' },
              { label: 'Email Address', value: profile?.email, icon: '📧' },
              { label: 'Phone Number', value: profile?.phone_number, icon: '📱' },
              { label: 'CNIC', value: profile?.cnic, icon: '🪪' },
              { label: 'Account Type', value: profile?.person_type, icon: '🔑' },
              ...(profile?.date_of_birth ? [{ label: 'Date of Birth', value: profile?.date_of_birth, icon: '🎂' }] : []),
              ...(profile?.gender ? [{ label: 'Gender', value: profile?.gender, icon: '⚧' }] : []),
              { label: 'Wallet Account', value: profile?.wallet_account, icon: '💳' },
              { label: 'Wallet Balance', value: `Rs ${profile?.current_amount?.toLocaleString()}`, icon: '💰' },
              ...(profile?.rank ? [{ label: 'Rank', value: profile?.rank, icon: '🏅' }] : []),
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px 20px',
                background: '#f8f9fa', borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ color: '#1a1a2e', fontSize: '14px', fontWeight: '700' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        }}>
          {error && (
            <div style={{
              background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
              borderRadius: '10px', padding: '12px 15px', color: '#ff4757',
              fontSize: '13px', marginBottom: '20px',
            }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{
              background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)',
              borderRadius: '10px', padding: '12px 15px', color: '#00d4aa',
              fontSize: '13px', marginBottom: '20px',
            }}>
              ✅ {success}
            </div>
          )}

          <p style={{
            background: 'rgba(0,123,255,0.08)',
            border: '1px solid rgba(0,123,255,0.2)',
            borderRadius: '10px', padding: '12px 15px',
            color: '#007bff', fontSize: '13px', marginBottom: '25px',
          }}>
            ℹ️ You can only update your name and phone number.
          </p>

          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                color: '#666', fontSize: '13px', fontWeight: '600',
                display: 'block', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '2px solid #f0f2f5', borderRadius: '12px',
                  fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box', color: '#1a1a2e',
                }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                color: '#666', fontSize: '13px', fontWeight: '600',
                display: 'block', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="Enter phone number"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '2px solid #f0f2f5', borderRadius: '12px',
                  fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box', color: '#1a1a2e',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              style={{
                width: '100%', padding: '15px',
                background: updating
                  ? 'rgba(0,212,170,0.5)'
                  : 'linear-gradient(135deg, #00d4aa, #007bff)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontSize: '16px', fontWeight: '700',
                cursor: updating ? 'not-allowed' : 'pointer',
                boxShadow: '0 5px 20px rgba(0,212,170,0.3)',
              }}
            >
              {updating ? 'Updating...' : 'Update Profile ✏️'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;