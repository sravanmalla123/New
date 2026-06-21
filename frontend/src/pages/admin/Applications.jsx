import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    const q = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/applications${q}`).then(d => setApps(d.applications || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/applications/${id}/approve`, { admin_notes: adminNotes });
      setMessage(`✅ Approved! Temp password: ${res.temp_password} — Email: ${res.email}. Note: ${res.note}`);
      setSelected(null);
      load();
    } catch (err) { setMessage('❌ ' + err.message); }
    finally { setActionLoading(false); }
  };

  const reject = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/applications/${id}/reject`, { admin_notes: adminNotes });
      setMessage('Application rejected.');
      setSelected(null);
      load();
    } catch (err) { setMessage('❌ ' + err.message); }
    finally { setActionLoading(false); }
  };

  const statusColor = { pending: 'badge-saffron', approved: 'badge-green', rejected: 'badge-red' };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/admin">Dashboard</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Applications</span>
          </div>
          <h1>📋 College/University Applications</h1>
          <p>Review and manage partnership applications from academic institutions</p>
        </div>
      </div>
      <div className="section-sm">
        <div className="container">
          {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : message.startsWith('❌') ? 'alert-error' : 'alert-info'}`} style={{ marginBottom: '1rem' }}>{message}</div>}

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '8px', textTransform: 'capitalize' }}>
                {f === 'all' ? 'All Applications' : f}
              </button>
            ))}
          </div>

          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Organization</th>
                    <th>Type</th>
                    <th>Contact</th>
                    <th>State</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>No applications found</td></tr>
                  ) : apps.map(app => (
                    <tr key={app.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{app.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--white)' }}>{app.org_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{app.email}</div>
                      </td>
                      <td><span className="badge badge-blue">{app.org_type}</span></td>
                      <td>
                        <div style={{ color: 'var(--text-primary)' }}>{app.contact_person}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{app.phone}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{app.state || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                      <td><span className={`badge ${statusColor[app.status]}`}>{app.status}</span></td>
                      <td>
                        <button onClick={() => { setSelected(app); setAdminNotes(app.admin_notes || ''); setMessage(''); }}
                          className="btn btn-sm btn-secondary" style={{ borderRadius: '8px' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail Modal */}
          {selected && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 10, 6, 0.85)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="card" style={{ maxWidth: '600px', width: '100%', background: 'var(--navy-card)', border: '1px solid var(--glass-border)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--white)' }}>Application Details</h3>
                  <button onClick={() => setSelected(null)} className="btn btn-sm btn-secondary" style={{ borderRadius: '8px' }}>✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    ['Organization', selected.org_name],
                    ['Type', selected.org_type],
                    ['Email', selected.email],
                    ['Phone', selected.phone],
                    ['Contact Person', selected.contact_person],
                    ['Designation', selected.contact_designation || '—'],
                    ['City', selected.city || '—'],
                    ['State', selected.state || '—'],
                    ['Students', selected.student_count || '—'],
                    ['Faculty', selected.faculty_count || '—'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{k}</div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {selected.areas_of_interest && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Areas of Interest</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selected.areas_of_interest.split(',').map(a => <span key={a} className="badge badge-blue">{a.trim()}</span>)}
                    </div>
                  </div>
                )}

                {selected.proposed_contribution && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>Proposed Contribution</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>{selected.proposed_contribution}</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Admin Notes</label>
                  <textarea className="form-control" rows="3" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes (visible internally)" readOnly={selected.status !== 'pending'}></textarea>
                </div>

                {selected.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => approve(selected.id)} className="btn btn-green w-full" disabled={actionLoading}>
                      {actionLoading ? '⏳...' : '✅ Approve & Create Account'}
                    </button>
                    <button onClick={() => reject(selected.id)} className="btn btn-danger" disabled={actionLoading}>
                      ✕ Reject
                    </button>
                  </div>
                )}
                {selected.status !== 'pending' && (
                  <div className={`alert ${selected.status === 'approved' ? 'alert-success' : 'alert-error'}`}>
                    Application is {selected.status}
                    {selected.reviewed_at && ` on ${new Date(selected.reviewed_at).toLocaleDateString('en-IN')}`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
