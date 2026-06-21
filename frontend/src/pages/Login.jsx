import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--gradient-hero)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="48" height="48" viewBox="0 0 36 36" fill="none" style={{ margin: '0 auto 1rem' }}>
            <circle cx="18" cy="18" r="17" stroke="var(--primary)" strokeWidth="2"/>
            <path d="M18 6L22 14H30L24 19L26 27L18 22L10 27L12 19L6 14H14L18 6Z" fill="var(--primary)"/>
          </svg>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: 'var(--white)', marginBottom: '0.25rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to your Adarsh Gram account</p>
        </div>

        {/* Demo Credentials */}
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Demo Credentials:</div>
            <div style={{ fontSize: '0.82rem' }}>Admin: admin@adarshgram.gov.in / Admin@123</div>
            <div style={{ fontSize: '0.82rem' }}>College: iitb@adarshgram.gov.in / College@123</div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--navy-card)', border: '1px solid var(--glass-border)' }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-control" placeholder="you@example.gov.in" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="••••••••" required
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '0.5rem', borderRadius: '12px', padding: '0.875rem' }}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Want to partner with us?{' '}
          <Link to="/partner" style={{ color: 'var(--primary)', fontWeight: 600 }}>Apply Here</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
