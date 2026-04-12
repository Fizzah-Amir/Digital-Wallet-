import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    cnic: '',
    person_type: 'user',
    date_of_birth: '',
    gender: 'Male',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.person_type !== 'user') {
        delete payload.date_of_birth;
        delete payload.gender;
      }
      const res = await api.post('/register/', payload);
      setSuccess(`Account created! Wallet: ${res.data.wallet_account}`);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontWeight: '600',
    display: 'block',
    marginBottom: '7px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2f5e 50%, #0a1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '30px 0',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '50px',
        width: '480px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, #00d4aa, #007bff)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 15px',
          }}>
            💳
          </div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: '0 0 5px' }}>
            Create Account
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
            Join EasyWallet today
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,71,87,0.15)',
            border: '1px solid rgba(255,71,87,0.3)',
            borderRadius: '10px',
            padding: '12px 15px',
            color: '#ff4757',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(0,212,170,0.15)',
            border: '1px solid rgba(0,212,170,0.3)',
            borderRadius: '10px',
            padding: '12px 15px',
            color: '#00d4aa',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {success} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Account Type</label>
            <select
              name="person_type"
              value={form.person_type}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="user" style={{ background: '#1a2f5e' }}>User</option>
              <option value="merchant" style={{ background: '#1a2f5e' }}>Merchant</option>
            </select>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={inputStyle}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="03001234567"
              required
              style={inputStyle}
            />
          </div>

          {/* CNIC */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>CNIC</label>
            <input
              type="text"
              name="cnic"
              value={form.cnic}
              onChange={handleChange}
              placeholder="3520112345671"
              required
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={inputStyle}
            />
          </div>

          {/* User only fields */}
          {form.person_type === 'user' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="Male" style={{ background: '#1a2f5e' }}>Male</option>
                  <option value="Female" style={{ background: '#1a2f5e' }}>Female</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading
                ? 'rgba(0,212,170,0.5)'
                : 'linear-gradient(135deg, #00d4aa, #007bff)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 5px 20px rgba(0,212,170,0.3)',
              marginTop: '10px',
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
          marginTop: '25px',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: '#00d4aa',
            textDecoration: 'none',
            fontWeight: '600',
          }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;