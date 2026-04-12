import { useState, useEffect } from 'react';
import api from '../api/axios';

const Rank = () => {
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rank/').then(res => {
      setRank(res.data);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const rankColors = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#00d4aa',
    Diamond: '#007bff',
  };

  const rankEmojis = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '👑',
  };

  const allRanks = [
    { name: 'Bronze', min: 0, max: 10 },
    { name: 'Silver', min: 11, max: 25 },
    { name: 'Gold', min: 26, max: 50 },
    { name: 'Platinum', min: 51, max: 100 },
    { name: 'Diamond', min: 101, max: null },
  ];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#00d4aa', fontFamily: "'Segoe UI', sans-serif" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1a1a2e', fontSize: '28px', fontWeight: '700', margin: '0 0 5px' }}>
          My Rank 🏅
        </h1>
        <p style={{ color: '#888', margin: 0 }}>Your transaction rank and limits</p>
      </div>

      {/* Current Rank Card */}
      {rank && (
        <div style={{
          background: `linear-gradient(135deg, ${rankColors[rank.rank_name]}22, ${rankColors[rank.rank_name]}44)`,
          border: `2px solid ${rankColors[rank.rank_name]}`,
          borderRadius: '24px', padding: '35px',
          marginBottom: '25px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: '70px', marginBottom: '10px' }}>
            {rankEmojis[rank.rank_name]}
          </div>
          <h2 style={{
            color: rankColors[rank.rank_name],
            fontSize: '36px', fontWeight: '800',
            margin: '0 0 5px',
          }}>
            {rank.rank_name}
          </h2>
          <p style={{ color: '#666', fontSize: '15px', margin: '0 0 25px' }}>
            Current Rank
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
          }}>
            <div style={{
              background: '#fff', borderRadius: '16px',
              padding: '18px 10px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
            }}>
              <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Transactions
              </p>
              <p style={{ color: '#1a1a2e', fontWeight: '800', fontSize: '24px', margin: 0 }}>
                {rank.total_transactions}
              </p>
            </div>
            <div style={{
              background: '#fff', borderRadius: '16px',
              padding: '18px 10px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
            }}>
              <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Max Amount
              </p>
              <p style={{ color: rankColors[rank.rank_name], fontWeight: '800', fontSize: '18px', margin: 0 }}>
                Rs {rank.max_amount?.toLocaleString()}
              </p>
            </div>
            <div style={{
              background: '#fff', borderRadius: '16px',
              padding: '18px 10px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
            }}>
              <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Next Rank At
              </p>
              <p style={{ color: '#007bff', fontWeight: '800', fontSize: '24px', margin: 0 }}>
                {rank.max_transaction ? rank.max_transaction + 1 : '∞'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Ranks */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        padding: '25px 30px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
      }}>
        <h3 style={{ color: '#1a1a2e', fontSize: '16px', fontWeight: '700', margin: '0 0 20px' }}>
          All Rank Levels
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allRanks.map((r) => (
            <div key={r.name} style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px 20px',
              background: rank?.rank_name === r.name
                ? `${rankColors[r.name]}15`
                : '#f8f9fa',
              borderRadius: '14px',
              border: rank?.rank_name === r.name
                ? `2px solid ${rankColors[r.name]}`
                : '2px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{rankEmojis[r.name]}</span>
                <div>
                  <p style={{
                    margin: 0, fontWeight: '700',
                    color: rankColors[r.name], fontSize: '16px',
                  }}>
                    {r.name}
                  </p>
                  <p style={{ margin: 0, color: '#aaa', fontSize: '12px' }}>
                    {r.min} - {r.max ? r.max : '∞'} transactions
                  </p>
                </div>
              </div>
              {rank?.rank_name === r.name && (
                <span style={{
                  background: rankColors[r.name],
                  color: '#fff', fontSize: '11px',
                  fontWeight: '700', padding: '4px 12px',
                  borderRadius: '20px',
                }}>
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rank;