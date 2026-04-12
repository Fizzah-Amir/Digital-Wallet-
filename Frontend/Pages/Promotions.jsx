import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Promotions = () => {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('view');
  const [form, setForm] = useState({
    promotion_cost: '',
    duration: '',
    promotional_advertisement: '',
  });

  const fetchPromotions = async () => {
    try {
      const res = await api.get('/promotions/');
      const data = res.data;
      if (Array.isArray(data)) {
        setPromotions(data);
      } else if (data.promotions) {
        setPromotions(data.promotions);
      } else if (data.results) {
        setPromotions(data.results);
      } else {
        setPromotions([]);
      }
    } catch (err) {
      console.error(err);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPromotions();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/merchant/promotion/create/', {
        promotion_cost: parseFloat(form.promotion_cost),
        duration: parseInt(form.duration),
        promotional_advertisement: form.promotional_advertisement,
      });
      setSuccess('Promotion created successfully!');
      setForm({ promotion_cost: '', duration: '', promotional_advertisement: '' });
      fetchPromotions();
      setActiveTab('view');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create promotion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Promotions 📢
        </h1>
        <p style={{ color: '#888', margin: 0 }}>View active promotions</p>
      </div>

      {/* Tabs - only merchant sees create tab */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button
          onClick={() => setActiveTab('view')}
          style={{
            padding: '10px 25px',
            background: activeTab === 'view'
              ? 'linear-gradient(135deg, #00d4aa, #007bff)'
              : '#fff',
            border: activeTab === 'view' ? 'none' : '2px solid #f0f2f5',
            borderRadius: '12px',
            color: activeTab === 'view' ? '#fff' : '#666',
            fontSize: '14px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📢 Active Promotions
        </button>
        {user?.person_type === 'merchant' && (
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '10px 25px',
              background: activeTab === 'create'
                ? 'linear-gradient(135deg, #00d4aa, #007bff)'
                : '#fff',
              border: activeTab === 'create' ? 'none' : '2px solid #f0f2f5',
              borderRadius: '12px',
              color: activeTab === 'create' ? '#fff' : '#666',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ➕ Create Promotion
          </button>
        )}
      </div>

      {activeTab === 'view' ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>
              Loading...
            </div>
          ) : promotions.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: '20px',
              padding: '40px', textAlign: 'center',
              boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>📢</div>
              <p style={{ color: '#aaa', fontSize: '15px' }}>No active promotions right now</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {promotions.map((promo, index) => (
                <div key={index} style={{
                  background: '#fff', borderRadius: '20px',
                  padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f2f5',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '4px',
                    background: 'linear-gradient(135deg, #00d4aa, #007bff)',
                  }} />
                  <div style={{
                    width: '45px', height: '45px',
                    background: 'rgba(0,212,170,0.1)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px',
                    marginBottom: '15px',
                  }}>
                    📢
                  </div>
                  <p style={{ color: '#1a1a2e', fontWeight: '600', fontSize: '15px', margin: '0 0 10px', lineHeight: '1.5' }}>
                    {promo.promotional_advertisement}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f2f5' }}>
                    <div>
                      <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Duration
                      </p>
                      <p style={{ color: '#007bff', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                        {promo.duration} days
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        By
                      </p>
                      <p style={{ color: '#1a1a2e', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                        {promo.merchant_name || 'Merchant'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
          maxWidth: '600px',
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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                color: '#666', fontSize: '13px', fontWeight: '600',
                display: 'block', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                Advertisement Text
              </label>
              <textarea
                value={form.promotional_advertisement}
                onChange={(e) => setForm({ ...form, promotional_advertisement: e.target.value })}
                placeholder="Enter your promotion details..."
                required
                rows={4}
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '2px solid #f0f2f5', borderRadius: '12px',
                  fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box', color: '#1a1a2e',
                  resize: 'vertical', fontFamily: "'Segoe UI', sans-serif",
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div>
                <label style={{
                  color: '#666', fontSize: '13px', fontWeight: '600',
                  display: 'block', marginBottom: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Promotion Cost (Rs)
                </label>
                <input
                  type="number"
                  value={form.promotion_cost}
                  onChange={(e) => setForm({ ...form, promotion_cost: e.target.value })}
                  placeholder="Enter cost"
                  required
                  min="1"
                  style={{
                    width: '100%', padding: '14px 16px',
                    border: '2px solid #f0f2f5', borderRadius: '12px',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', color: '#1a1a2e',
                  }}
                />
              </div>
              <div>
                <label style={{
                  color: '#666', fontSize: '13px', fontWeight: '600',
                  display: 'block', marginBottom: '8px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Duration (Days)
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="Enter days"
                  required
                  min="1"
                  style={{
                    width: '100%', padding: '14px 16px',
                    border: '2px solid #f0f2f5', borderRadius: '12px',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', color: '#1a1a2e',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading
                  ? 'rgba(0,212,170,0.5)'
                  : 'linear-gradient(135deg, #00d4aa, #007bff)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontSize: '16px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 5px 20px rgba(0,212,170,0.3)',
              }}
            >
              {loading ? 'Creating...' : 'Create Promotion 📢'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Promotions;