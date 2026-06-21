import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';

export default function VillageDetail() {
  const { id } = useParams();
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/villages/${id}`).then(setVillage).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner" style={{ minHeight: '80vh' }}><div className="spinner"></div></div>;
  if (!village) return <div className="container section"><div className="alert alert-error">Village not found</div></div>;

  const scoreColor = village.score >= 80 ? 'var(--primary)' : village.score >= 60 ? 'var(--saffron)' : 'var(--red)';

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link><span className="breadcrumb-sep">›</span>
            <Link to="/villages">Villages</Link><span className="breadcrumb-sep">›</span>
            <span>{village.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1>{village.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>📍 {village.block}, {village.district}, {village.state}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {village.adarsh_gram_declared ? <span className="badge badge-green">🌟 Adarsh Gram Declared</span> : null}
                <span className="badge badge-blue">Phase {village.phase}</span>
                <span className={`badge ${village.vdp_status === 'approved' ? 'badge-green' : 'badge-saffron'}`}>VDP {village.vdp_status}</span>
              </div>
            </div>
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 900, color: scoreColor, lineHeight: '1.1' }}>
                {village.score?.toFixed(1)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Overall Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-sm">
        <div className="container">
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Total Population', value: (village.total_population || 0).toLocaleString('en-IN'), icon: '👥' },
              { label: 'SC Population', value: (village.sc_population || 0).toLocaleString('en-IN'), icon: '🤝' },
              { label: 'Households', value: (village.total_households || 0).toLocaleString('en-IN'), icon: '🏠' },
              { label: 'Gram Panchayat', value: village.gram_panchayat || '—', icon: '🏛️' },
            ].map(m => (
              <div key={m.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{m.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--saffron)', marginBottom: '0.25rem' }}>
                  {m.value}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          {village.indicators?.length > 0 && (
            <div className="card" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
                📊 Monitorable Indicators
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {village.indicators.map(ind => {
                  const pct = ind.target > 0 ? Math.min(Math.round((ind.achieved / ind.target) * 100), 100) : 0;
                  return (
                    <div key={ind.id} style={{ background: 'var(--navy-mid)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{ind.indicator_name}</span>
                        <span style={{ fontSize: '0.85rem', color: pct >= 80 ? 'var(--primary)' : 'var(--saffron)', fontWeight: 700 }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--gradient-primary)' : 'var(--gradient-saffron)' }}></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        <span>Achieved: {ind.achieved?.toLocaleString()}</span>
                        <span>Target: {ind.target?.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gallery */}
          {village.images?.length > 0 && (
            <div className="card" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
                📷 Progress Gallery
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {village.images.map(img => (
                  <div key={img.id} style={{ background: 'var(--navy-mid)', border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      height: '140px',
                      background: 'linear-gradient(135deg, var(--navy-mid), var(--navy-light))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      overflow: 'hidden'
                    }}>
                      {img.filename && !img.filename.startsWith('placeholder') ? (
                        <img src={`/uploads/${img.filename}`} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>📷</span>
                      )}
                    </div>
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--white)', marginBottom: '0.25rem' }}>
                        {img.title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        🏫 {img.uploader_org || img.uploader_name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {village.indicators?.length === 0 && (
            <div className="alert alert-info">No detailed data available for this village yet.</div>
          )}

          <Link to="/villages" className="btn btn-secondary mt-2">← Back to Villages</Link>
        </div>
      </div>
    </div>
  );
}
