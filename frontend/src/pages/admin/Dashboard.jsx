import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { icon: '📷', label: 'Upload Images', path: '/admin/upload', color: 'var(--saffron)', desc: 'Add progress photos' },
    ...(isAdmin ? [
      { icon: '📋', label: 'Applications', path: '/admin/applications', color: 'var(--primary)', desc: `${data?.pending_applications || 0} pending`, badge: data?.pending_applications },
      { icon: '🏘️', label: 'Villages', path: '/admin/villages', color: 'var(--blue-light)', desc: 'Manage village data' },
    ] : []),
    ...(isSuperAdmin ? [
      { icon: '👥', label: 'Users', path: '/admin/users', color: 'var(--saffron-light)', desc: 'Manage accounts' },
    ] : []),
  ];

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>📊 Dashboard</h1>
          <p>Welcome back, <strong style={{ color: 'var(--primary)' }}>{user?.name}</strong> — {user?.org_name || user?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="section-sm">
        <div className="container">
          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            <>
              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Total Villages', value: data?.total_villages || 0, icon: '🏘️', color: 'var(--saffron)' },
                  { label: 'Adarsh Gram Declared', value: data?.adarsh_gram_declared || 0, icon: '🌟', color: 'var(--primary)' },
                  { label: 'Pending Images', value: data?.pending_images || 0, icon: '📷', color: 'var(--saffron)' },
                  { label: 'Pending Applications', value: data?.pending_applications || 0, icon: '📋', color: 'var(--blue-light)' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ textAlign: 'center', borderColor: 'var(--glass-border)' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {quickLinks.map(l => (
                  <Link key={l.label} to={l.path} className="card" style={{ textDecoration: 'none', borderColor: 'var(--glass-border)', position: 'relative' }}>
                    {l.badge > 0 && (
                      <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--red)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>{l.badge}</span>
                    )}
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{l.icon}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: l.color, marginBottom: '0.25rem' }}>{l.label}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{l.desc}</div>
                  </Link>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Recent Images */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--white)' }}>Recent Image Uploads</h3>
                    <Link to="/admin/applications" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>View all</Link>
                  </div>
                  {data?.recent_images?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No images uploaded yet</p>
                  ) : data?.recent_images?.map(img => (
                    <div key={img.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--navy-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>📷</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--white)' }}>{img.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{img.uploader_org || img.uploader_name} • {img.village_name || 'General'}</div>
                      </div>
                      <span className={`badge ${img.status === 'approved' ? 'badge-green' : img.status === 'pending' ? 'badge-saffron' : 'badge-red'}`}>{img.status}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Applications */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--white)' }}>Recent Applications</h3>
                    <Link to="/admin/applications" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>View all</Link>
                  </div>
                  {data?.recent_applications?.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No applications yet</p>
                  ) : data?.recent_applications?.map(app => (
                    <div key={app.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--navy-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>🏫</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--white)' }}>{app.org_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{app.org_type} • {app.contact_person}</div>
                      </div>
                      <span className={`badge ${app.status === 'approved' ? 'badge-green' : app.status === 'pending' ? 'badge-saffron' : 'badge-red'}`}>{app.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
