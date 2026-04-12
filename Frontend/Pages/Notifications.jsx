import { useState, useEffect } from 'react';
import api from '../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/').then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data.notifications) {
        setNotifications(data.notifications);
      } else if (data.results) {
        setNotifications(data.results);
      } else {
        setNotifications([]);
      }
    }).catch(() => setNotifications([]))
    .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          Notifications 🔔
        </h1>
        <p style={{ color: '#888', margin: 0 }}>
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa' }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>🔔</div>
            <p style={{ color: '#aaa', fontSize: '15px' }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notif, index) => (
              <div key={index} style={{
                display: 'flex', alignItems: 'flex-start',
                gap: '15px', padding: '18px 20px',
                background: '#f8f9fa', borderRadius: '14px',
                border: '1px solid #f0f2f5',
              }}>
                <div style={{
                  width: '45px', height: '45px', minWidth: '45px',
                  background: 'rgba(0,123,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px',
                }}>
                  🔔
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0, fontWeight: '600',
                    color: '#1a1a2e', fontSize: '14px',
                    lineHeight: '1.5',
                  }}>
                    {notif.message || notif.notification_id || 'New notification'}
                  </p>
                  <p style={{ margin: '5px 0 0', color: '#aaa', fontSize: '12px' }}>
                    {notif.timestamp ? new Date(notif.timestamp).toLocaleString() : ''}
                  </p>
                </div>
                <div style={{
                  width: '8px', height: '8px', minWidth: '8px',
                  background: '#007bff', borderRadius: '50%',
                  marginTop: '6px',
                }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;