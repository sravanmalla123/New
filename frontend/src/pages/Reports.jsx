import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [topStates, setTopStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/stats'), api.get('/stats/top-states')]).then(([s, ts]) => {
      setStats(s);
      setTopStates(ts);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Reports</span>
          </div>
          <h1>📊 Reports & Statistics</h1>
          <p>Comprehensive implementation data across all Adarsh Gram villages</p>
        </div>
      </div>
      <div className="section-sm">
        <div className="container">
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : (
            <>
              {/* Overview Cards */}
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem' }} id="overview">
                📋 Implementation Overview
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  { label: 'States Covered', value: stats?.villages.states, icon: '🗺️', color: 'var(--saffron)' },
                  { label: 'Districts', value: stats?.villages.districts, icon: '🏛️', color: 'var(--blue-light)' },
                  { label: 'Villages', value: stats?.villages.total?.toLocaleString('en-IN'), icon: '🏘️', color: 'var(--primary)' },
                  { label: 'Adarsh Gram Declared', value: stats?.adarsh_gram_declared?.toLocaleString('en-IN'), icon: '🌟', color: 'var(--saffron)' },
                  { label: 'VDP Approved', value: stats?.vdp_approved?.toLocaleString('en-IN'), icon: '📄', color: 'var(--blue-light)' },
                  { label: 'Works Identified', value: stats?.works.identified?.toLocaleString('en-IN'), icon: '📋', color: 'var(--primary)' },
                  { label: 'Works Completed', value: stats?.works.completed?.toLocaleString('en-IN'), icon: '✅', color: 'var(--saffron)' },
                  { label: 'Completion Rate', value: stats?.works.identified ? Math.round((stats.works.completed / stats.works.identified) * 100) + '%' : '0%', icon: '📈', color: 'var(--primary)' },
                ].map(c => (
                  <div key={c.label} className="card" style={{ textAlign: 'center', borderColor: 'var(--glass-border)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: c.color }}>
                      {c.value}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Population */}
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem' }}>
                👥 Population Coverage
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                  { label: 'Total Population', value: stats?.population.total?.toLocaleString('en-IN'), color: 'var(--blue-light)', pct: 100 },
                  { label: 'SC Population', value: stats?.population.sc?.toLocaleString('en-IN'), color: 'var(--primary)', pct: stats?.population.total ? Math.round((stats.population.sc / stats.population.total) * 100) : 0 },
                  { label: 'Total Households', value: stats?.population.households?.toLocaleString('en-IN'), color: 'var(--saffron)', pct: 75 },
                ].map(p => (
                  <div key={p.label} className="card">
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', color: p.color, marginBottom: '0.25rem' }}>
                      {p.value}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{p.label}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.pct}%`, background: p.color }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Funds */}
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem' }} id="funds">
                💰 Fund Utilization
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card">
                  <h4 style={{ color: 'var(--saffron)', fontFamily: 'var(--font-heading)', marginBottom: '1rem', fontWeight: 700 }}>
                    Funds Released
                  </h4>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.25rem', color: 'var(--saffron)' }}>
                    ₹{stats?.funds.released ? (stats.funds.released / 10000000).toFixed(2) + ' Cr' : '0'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Gap Filling Funds</div>
                </div>
                <div className="card">
                  <h4 style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginBottom: '1rem', fontWeight: 700 }}>
                    Funds Utilized
                  </h4>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.25rem', color: 'var(--primary)' }}>
                    ₹{stats?.funds.utilized ? (stats.funds.utilized / 10000000).toFixed(2) + ' Cr' : '0'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    Utilization Rate: {stats?.funds.released ? Math.round((stats.funds.utilized / stats.funds.released) * 100) : 0}%
                  </div>
                  <div className="progress-bar mt-3">
                    <div className="progress-fill" style={{ width: `${stats?.funds.released ? Math.round((stats.funds.utilized / stats.funds.released) * 100) : 0}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Top States */}
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem' }} id="districts">
                🏆 Top Performing States
              </h2>
              <div className="card">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>State</th>
                        <th>Villages</th>
                        <th>Avg Score</th>
                        <th>Adarsh Gram</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStates.map((s, i) => (
                        <tr key={s.state}>
                          <td>
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: i < 3 ? 'var(--saffron)' : 'var(--text-secondary)' }}>
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{s.state}</td>
                          <td>{s.village_count}</td>
                          <td style={{ color: s.avg_score >= 80 ? 'var(--primary)' : s.avg_score >= 60 ? 'var(--saffron)' : 'var(--red)', fontWeight: 700 }}>
                            {s.avg_score?.toFixed(1)}
                          </td>
                          <td><span className="badge badge-green">{s.adarsh_declared}</span></td>
                          <td style={{ width: '150px' }}>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${s.avg_score || 0}%` }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Partners */}
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem', marginTop: '2.5rem' }}>
                🎓 Academic Partners
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Total Applications', value: stats?.applications.total, icon: '📋', color: 'var(--blue-light)' },
                  { label: 'Approved Partners', value: stats?.applications.approved, icon: '✅', color: 'var(--primary)' },
                  { label: 'Pending Review', value: stats?.applications.pending, icon: '⏳', color: 'var(--saffron)' },
                ].map(p => (
                  <div key={p.label} className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: p.color }}>
                      {p.value}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
