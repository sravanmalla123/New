import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function VillageManage() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', state: '', district: '', block: '', gram_panchayat: '', phase: 1, sc_population: '', total_population: '', total_households: '', lat: '', lng: '' });
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    const q = search ? `?search=${search}` : '';
    api.get(`/villages${q}&limit=100`).then(d => setVillages(d.villages || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/villages', form);
      setMessage('✅ Village added successfully!');
      setShowForm(false);
      setForm({ name: '', state: '', district: '', block: '', gram_panchayat: '', phase: 1, sc_population: '', total_population: '', total_households: '', lat: '', lng: '' });
      load();
    } catch (err) { setMessage('❌ ' + err.message); }
  };

  const toggleAdarsh = async (v) => {
    try {
      await api.put(`/villages/${v.id}`, { adarsh_gram_declared: v.adarsh_gram_declared ? 0 : 1 });
      load();
    } catch (err) { setMessage('❌ ' + err.message); }
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/admin">Dashboard</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Villages</span>
          </div>
          <h1>🏘️ Manage Villages</h1>
          <p>Add, edit, and track Adarsh Gram village data</p>
        </div>
      </div>

      <div className="section-sm">
        <div className="container">
          {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{message}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <input type="text" className="form-control" placeholder="🔍 Search villages..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '300px' }} />
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ Add Village</button>
          </div>

          {showForm && (
            <div className="card" style={{ background: 'var(--navy-card)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--primary)' }}>Add New Village</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Village Name *</label><input type="text" className="form-control" required value={form.name} onChange={e => set('name', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">State *</label><input type="text" className="form-control" required value={form.state} onChange={e => set('state', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">District *</label><input type="text" className="form-control" required value={form.district} onChange={e => set('district', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Block *</label><input type="text" className="form-control" required value={form.block} onChange={e => set('block', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Gram Panchayat</label><input type="text" className="form-control" value={form.gram_panchayat} onChange={e => set('gram_panchayat', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Phase</label><select className="form-control" value={form.phase} onChange={e => set('phase', e.target.value)}><option value={1}>Phase 1</option><option value={2}>Phase 2</option><option value={3}>Phase 3</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">SC Population</label><input type="number" className="form-control" value={form.sc_population} onChange={e => set('sc_population', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Total Population</label><input type="number" className="form-control" value={form.total_population} onChange={e => set('total_population', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Latitude</label><input type="number" step="any" className="form-control" placeholder="20.5937" value={form.lat} onChange={e => set('lat', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Longitude</label><input type="number" step="any" className="form-control" placeholder="78.9629" value={form.lng} onChange={e => set('lng', e.target.value)} /></div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Add Village</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Village</th><th>Location</th><th>Phase</th><th>Score</th><th>Adarsh Gram</th><th>VDP Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {villages.map(v => (
                    <tr key={v.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{v.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--white)' }}>{v.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>GP: {v.gram_panchayat || '—'}</div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--text-primary)' }}>{v.district}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{v.state}</div>
                      </td>
                      <td><span className="badge badge-blue">Phase {v.phase}</span></td>
                      <td>
                        <div style={{ color: v.score >= 80 ? 'var(--primary)' : v.score >= 60 ? 'var(--saffron)' : 'var(--red)', fontWeight: 700 }}>
                          {v.score?.toFixed(1) || '0.0'}
                        </div>
                      </td>
                      <td>
                        <button onClick={() => toggleAdarsh(v)} className={`btn btn-sm ${v.adarsh_gram_declared ? 'btn-green' : 'btn-secondary'}`} style={{ borderRadius: '8px', fontSize: '0.75rem' }}>
                          {v.adarsh_gram_declared ? '🌟 Yes' : '—'}
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${v.vdp_status === 'approved' ? 'badge-green' : 'badge-saffron'}`}>{v.vdp_status}</span>
                      </td>
                      <td>
                        <Link to={`/villages/${v.id}`} className="btn btn-sm btn-secondary" style={{ borderRadius: '8px', fontSize: '0.75rem' }}>View</Link>
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
