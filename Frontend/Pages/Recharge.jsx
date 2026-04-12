import { useState, useEffect } from 'react';
import api from '../api/axios';

const Recharge = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState('recharge');

  useEffect(() => {
    api.get('/recharge/services/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setServices(data);
      } else if (data.services) {
        setServices(data.services);
      } else {
        setServices([]);
      }
    }).catch(() => setServices([]));

    api.get('/wallet/').then(res => setWallet(res.data));

    api.get('/recharge/history/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data.history) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    }).catch(() => setHistory([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/recharge/', {
        service_id: parseInt(selectedService),
        amount: parseFloat(amount),
      });
      setSuccess('Recharge successful!');
      setSelectedService('');
      setAmount('');
      const walletRes = await api.get('/wallet/');
      setWallet(walletRes.data);
      const historyRes = await api.get('/recharge/history/');
      const data = historyRes.data;
      setHistory(Array.isArray(data) ? data : data.history || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  const telecomColors = {
    Jazz: '#ff6b35',
    Telenor: '#0066cc',
    Zong: '#cc0000',
    Ufone: '#00aa44',
    SCOM: '#9933cc',
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Mobile Recharge 📱
        </h1>
        <p style={{ color: '#888', margin: 0 }}>Recharge your mobile instantly</p>
      </div>

      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628, #1a2f5e)',
        borderRadius: '20px', padding: '25px 30px',
        marginBottom: '25px', color: '#fff',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Available Balance
        </p>
        <h2 style={{ color: '#00d4aa', fontSize: '32px', fontWeight: '800', margin: 0 }}>
          Rs {wallet?.current_amount?.toLocaleString() || '0'}
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {['recharge', 'history'].map((tab) => (
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
            }}
          >
            {tab === 'recharge' ? '📱 Recharge' : '📋 History'}
          </button>
        ))}
      </div>

      {activeTab === 'recharge' ? (
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

          {/* Telecom Services */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              color: '#666', fontSize: '13px', fontWeight: '600',
              display: 'block', marginBottom: '12px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Select Network
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {services.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '14px' }}>Loading services...</p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.service_id}
                    onClick={() => setSelectedService(service.service_id.toString())}
                    style={{
                      padding: '12px 20px',
                      background: selectedService === service.service_id.toString()
                        ? `${telecomColors[service.service_name] || '#007bff'}20`
                        : '#f8f9fa',
                      border: selectedService === service.service_id.toString()
                        ? `2px solid ${telecomColors[service.service_name] || '#007bff'}`
                        : '2px solid #f0f2f5',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      color: selectedService === service.service_id.toString()
                        ? telecomColors[service.service_name] || '#007bff'
                        : '#666',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {service.service_name}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Amounts */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              color: '#666', fontSize: '13px', fontWeight: '600',
              display: 'block', marginBottom: '12px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Quick Amount
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[50, 100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  style={{
                    padding: '10px 18px',
                    background: amount === amt.toString()
                      ? 'linear-gradient(135deg, #00d4aa, #007bff)'
                      : '#f8f9fa',
                    border: 'none', borderRadius: '10px',
                    color: amount === amt.toString() ? '#fff' : '#666',
                    fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Rs {amt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                color: '#666', fontSize: '13px', fontWeight: '600',
                display: 'block', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                Amount (Rs)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
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

            <button
              type="submit"
              disabled={loading || !selectedService}
              style={{
                width: '100%', padding: '15px',
                background: loading || !selectedService
                  ? 'rgba(0,212,170,0.5)'
                  : 'linear-gradient(135deg, #00d4aa, #007bff)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontSize: '16px', fontWeight: '700',
                cursor: loading || !selectedService ? 'not-allowed' : 'pointer',
                boxShadow: '0 5px 20px rgba(0,212,170,0.3)',
              }}
            >
              {loading ? 'Processing...' : 'Recharge Now 📱'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
              No recharge history yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item, index) => (
                <div key={index} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '18px 20px',
                  background: '#f8f9fa', borderRadius: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      background: 'rgba(243,156,18,0.1)',
                      borderRadius: '14px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '22px',
                    }}>
                      📱
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '15px' }}>
                        {item.service_name}
                      </p>
                      <p style={{ margin: '3px 0 0', color: '#aaa', fontSize: '12px' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '18px', color: '#ff4757' }}>
                    -Rs {item.amount?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recharge;