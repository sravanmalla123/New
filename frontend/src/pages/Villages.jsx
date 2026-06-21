import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Villages() {
  const [villages, setVillages] = useState([]);
  const [total, setTotal] = useState(0);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', phase: '', search: '' });
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: LIMIT, offset: page * LIMIT });
    if (filters.state) params.set('state', filters.state);
    if (filters.phase) params.set('phase', filters.phase);
    if (filters.search) params.set('search', filters.search);
    api.get(`/villages?${params}`).then(d => {
      setVillages(d.villages || []);
      setTotal(d.total || 0);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/villages/states').then(setStates); }, []);

  const set = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(0); };

  const scoreColor = (s) => s >= 80 ? 'var(--primary)' : s >= 60 ? 'var(--saffron)' : 'var(--red)';

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Villages</span>
          </div>
          <h1>🏘️ Adarsh Gram Villages</h1>
          <p>Browse and search all {total.toLocaleString('en-IN')} villages under the scheme</p>
        </div>
      </div>
      <div className="section-sm">
        <div className="container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search village, block..."
              value={filters.search}
              onChange={e => set('search', e.target.value)}
              style={{ maxWidth: '280px' }}
            />
            <select className="form-control" value={filters.state} onChange={e => set('state', e.target.value)} style={{ maxWidth: '200px' }}>
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-control" value={filters.phase} onChange={e => set('phase', e.target.value)} style={{ maxWidth: '160px' }}>
              <option value="">All Phases</option>
              <option value="1">Phase 1</option>
              <option value="2">Phase 2</option>
              <option value="3">Phase 3</option>
            </select>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', alignSelf: 'center' }}>
              Showing {villages.length} of {total}
            </span>
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {villages.map(v => (
                  <Link key={v.id} to={`/villages/${v.id}`} className="card" style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--white)' }}>
                          {v.name}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>📍 {v.district}, {v.state}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: scoreColor(v.score), lineHeight: 1 }}>
                          {v.score?.toFixed(0) || 0}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Score</div>
                      </div>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                      <div className="progress-fill" style={{ width: `${v.score || 0}%`, background: scoreColor(v.score) }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-blue">Phase {v.phase}</span>
                      {v.adarsh_gram_declared ? <span className="badge badge-green">🌟 Adarsh Gram</span> : null}
                      <span className={`badge ${v.vdp_status === 'approved' ? 'badge-green' : 'badge-saffron'}`}>VDP: {v.vdp_status}</span>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <span>👥 Pop: {(v.total_population || 0).toLocaleString()}</span>
                      <span>🏠 HH: {(v.total_households || 0).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.875rem' }}>
                  Page {page + 1} of {Math.ceil(total / LIMIT)}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={(page + 1) * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
