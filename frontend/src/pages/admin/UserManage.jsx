import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'state_admin', org_name: '', state: '', phone: '' });
  const [message, setMessage] = useState('');

  const load = () => {
    api.get('/admin/users').then(setUsers).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      setMessage('✅ User created successfully!');
      setShowForm(false);
      load();
    } catch (err) { setMessage('❌ ' + err.message); }
  };

  const toggleStatus = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}/status`, { status: u.status === 'active' ? 'inactive' : 'active' });
      load();
    } catch (err) { setMessage('❌ ' + err.message); }
  };

  const roleColor = { super_admin: 'badge-red', state_admin: 'badge-saffron', district_admin: 'badge-blue', college: 'badge-green' };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/admin">Dashboard</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Users</span>
          </div>
          <h1>👥 User Management</h1>
          <p>Create and manage portal user accounts</p>
        </div>
      </div>
      <div className="section-sm">
        <div className="container">
          {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{message}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ Create User</button>
          </div>

          {showForm && (
            <div className="card" style={{ background: 'var(--navy-card)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--primary)' }}>Create New User</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name *</label><input type="text" className="form-control" required value={form.name} onChange={e => set('name', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" required value={form.email} onChange={e => set('email', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-control" required value={form.password} onChange={e => set('password', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Role *</label>
                    <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                      <option value="state_admin">State Admin</option>
                      <option value="district_admin">District Admin</option>
                      <option value="college">College/University</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Organization</label><input type="text" className="form-control" value={form.org_name} onChange={e => set('org_name', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">State</label><input type="text" className="form-control" value={form.state} onChange={e => set('state', e.target.value)} /></div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Create User</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Org/State</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{u.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--white)' }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                      <td><span className={`badge ${roleColor[u.role] || 'badge-gray'}`}>{u.role?.replace('_', ' ')}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.org_name || u.state || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                      <td><span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>{u.status}</span></td>
                      <td>
                        <button onClick={() => toggleStatus(u)} className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-green'}`} style={{ borderRadius: '8px', fontSize: '0.75rem' }}>
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
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
    </div>
  );
}
