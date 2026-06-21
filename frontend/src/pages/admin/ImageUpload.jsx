import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['development', 'infrastructure', 'education', 'health', 'energy', 'water', 'social', 'ceremony', 'agriculture', 'other'];

export default function ImageUpload() {
  const { user, isAdmin } = useAuth();
  const [villages, setVillages] = useState([]);
  const [pending, setPending] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: 'development', village_id: '', show_on_home: false });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('upload');

  useEffect(() => {
    api.get('/villages?limit=100').then(d => setVillages(d.villages || []));
    if (isAdmin) {
      api.get('/images/pending').then(d => setPending(Array.isArray(d) ? d : []));
    }
  }, [isAdmin]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setMessage('❌ Please select an image'); return; }
    setLoading(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      if (form.village_id) fd.append('village_id', form.village_id);
      if (isAdmin && form.show_on_home) fd.append('show_on_home', 'true');
      const res = await api.postForm('/images/upload', fd);
      setMessage(`✅ ${res.message}`);
      setFile(null);
      setPreview(null);
      setForm({ title: '', description: '', category: 'development', village_id: '', show_on_home: false });
      if (isAdmin) api.get('/images/pending').then(d => setPending(Array.isArray(d) ? d : []));
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveImage = async (id, showOnHome) => {
    try {
      await api.put(`/images/${id}/approve`, { show_on_home: showOnHome });
      setPending(p => p.filter(i => i.id !== id));
      setMessage('✅ Image approved and published');
    } catch (err) { setMessage('❌ ' + err.message); }
  };

  const rejectImage = async (id) => {
    try {
      await api.put(`/images/${id}/reject`, {});
      setPending(p => p.filter(i => i.id !== id));
    } catch (err) { setMessage('❌ ' + err.message); }
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/admin">Dashboard</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Image Upload</span>
          </div>
          <h1>📷 Upload Progress Images</h1>
          <p>Document and share village development progress</p>
        </div>
      </div>

      <div className="section-sm">
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Tabs */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button onClick={() => setTab('upload')} className={`btn btn-sm ${tab === 'upload' ? 'btn-primary' : 'btn-secondary'}`} style={{ borderRadius: '8px' }}>
                📤 Upload Image
              </button>
              <button onClick={() => setTab('pending')} className={`btn btn-sm ${tab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} style={{ borderRadius: '8px', position: 'relative' }}>
                ⏳ Pending Approval
                {pending.length > 0 && (
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--red)', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pending.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>{message}</div>}

          {tab === 'upload' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
              {/* Upload Form */}
              <div className="card" style={{ background: 'var(--navy-card)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
                  Upload Details
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Image File *</label>
                    <div style={{ border: '2px dashed var(--primary-glow)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--primary-dim)' }}
                      onClick={() => document.getElementById('file-input').click()}>
                      <input id="file-input" type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Click to select image</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>JPEG, PNG, WebP — Max 10MB</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input type="text" className="form-control" placeholder="e.g., Road construction progress" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="2" placeholder="Brief description of the activity" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-control" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Village (optional)</label>
                      <select className="form-control" value={form.village_id} onChange={e => setForm(p => ({ ...p, village_id: e.target.value }))}>
                        <option value="">Select Village</option>
                        {villages.map(v => <option key={v.id} value={v.id}>{v.name} — {v.district}</option>)}
                      </select>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.show_on_home} onChange={e => setForm(p => ({ ...p, show_on_home: e.target.checked }))} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                        <span className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>🏠 Show on Homepage Carousel</span>
                      </label>
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? '⏳ Uploading...' : '📤 Upload Image'}
                  </button>
                  {!isAdmin && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>Your image will appear on the homepage after admin approval</p>}
                </form>
              </div>

              {/* Preview */}
              <div className="card" style={{ background: 'var(--navy-card)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary)' }}>
                  Preview
                </h3>
                {preview ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '280px' }} />
                    <div style={{ background: 'var(--navy-mid)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-saffron">{form.category}</span>
                        {form.show_on_home && <span className="badge badge-green">🏠 Homepage</span>}
                      </div>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--white)' }}>{form.title || 'Image Title'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{form.description || 'No description'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>📤 {user?.org_name || user?.name}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem' }}>🖼️</div>
                    <p>Select an image to see preview</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'pending' && isAdmin && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--white)' }}>
                Pending Approval ({pending.length})
              </h3>
              {pending.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p>No pending images — all caught up!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {pending.map(img => (
                    <div key={img.id} className="card" style={{ background: 'var(--navy-card)', overflow: 'hidden', padding: 0 }}>
                      <div style={{
                        background: 'linear-gradient(135deg, var(--navy-mid), var(--navy-light))',
                        height: '160px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '3rem',
                        overflow: 'hidden',
                        justifyContent: 'center'
                      }}>
                        {img.filename && !img.filename.startsWith('placeholder') ? (
                          <img src={`/uploads/${img.filename}`} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>📷</span>
                        )}
                      </div>
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--white)' }}>{img.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                          By: {img.uploader_org || img.uploader_name} <br/>
                          📍 {img.village_name || 'General'} <br/>
                          📅 {new Date(img.created_at).toLocaleDateString('en-IN')}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => approveImage(img.id, true)} className="btn btn-green btn-sm" style={{ flex: 1, fontSize: '0.75rem', borderRadius: '8px' }}>
                              ✅ Approve & Home
                            </button>
                            <button onClick={() => approveImage(img.id, false)} className="btn btn-secondary btn-sm" style={{ borderRadius: '8px', fontSize: '0.75rem' }}>
                              ✓ Approve
                            </button>
                          </div>
                          <button onClick={() => rejectImage(img.id)} className="btn btn-danger btn-sm" style={{ borderRadius: '8px', width: '100%' }}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
