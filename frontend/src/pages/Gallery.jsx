import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['all', 'development', 'infrastructure', 'education', 'health', 'energy', 'water', 'social', 'ceremony'];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [page, setPage] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: LIMIT, offset: page * LIMIT });
    if (category !== 'all') params.set('category', category);
    api.get(`/images?${params}`).then(d => {
      setImages(d.images || []);
      setTotal(d.total || 0);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [category, page]);

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Gallery</span>
          </div>
          <h1>📷 Progress Gallery</h1>
          <p>Visual documentation of development works across Adarsh Gram villages</p>
        </div>
      </div>
      <div className="section-sm">
        <div className="container">
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(0); }}
                className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '8px', textTransform: 'capitalize' }}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div></div>
          ) : images.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <p>No images in this category yet.</p>
              <Link to="/partner" className="btn btn-primary mt-4">Upload Images by Partnering</Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {images.map(img => (
                  <div
                    key={img.id}
                    className="card"
                    style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    onClick={() => setLightbox(img)}
                  >
                    <div style={{
                      height: '200px',
                      background: 'linear-gradient(135deg, var(--navy-mid), var(--navy-light))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {img.filename && !img.filename.startsWith('placeholder') ? (
                        <img
                          src={`/uploads/${img.filename}`}
                          alt={img.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                          className="gallery-hover-img"
                        />
                      ) : (
                        <span>📷</span>
                      )}
                      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                        <span className="badge badge-saffron" style={{ fontSize: '0.7rem' }}>{img.category}</span>
                      </div>
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--white)' }}>
                          {img.title}
                        </h4>
                        {img.village_name && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            📍 {img.village_name}, {img.village_state}
                          </p>
                        )}
                        {img.uploader_org && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            🏫 {img.uploader_org}
                          </p>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                        📅 {new Date(img.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {total > LIMIT && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span style={{ color: 'var(--text-secondary)', alignSelf: 'center', fontSize: '0.875rem' }}>Page {page + 1}</span>
                  <button className="btn btn-secondary btn-sm" disabled={(page + 1) * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}

          {/* Lightbox */}
          {lightbox && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 10, 6, 0.95)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backdropFilter: 'blur(8px)'
              }}
              onClick={() => setLightbox(null)}
            >
              <div style={{ maxWidth: '800px', width: '100%' }} onClick={e => e.stopPropagation()}>
                <div style={{ background: 'var(--navy-card)', border: '1px solid var(--glass-border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{
                    height: '450px',
                    background: 'linear-gradient(135deg, var(--navy-mid), var(--navy-light))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '5rem',
                    overflow: 'hidden'
                  }}>
                    {lightbox.filename && !lightbox.filename.startsWith('placeholder') ? (
                      <img
                        src={`/uploads/${lightbox.filename}`}
                        alt={lightbox.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <span>📷</span>
                    )}
                  </div>
                  <div style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>
                        {lightbox.title}
                      </h3>
                      <span className="badge badge-saffron" style={{ fontSize: '0.75rem' }}>{lightbox.category}</span>
                    </div>
                    {lightbox.description && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                        {lightbox.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                      {lightbox.village_name && <span>📍 {lightbox.village_name}, {lightbox.village_state}</span>}
                      {lightbox.uploader_org && <span>🏫 {lightbox.uploader_org}</span>}
                      <span>📅 {new Date(lightbox.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary mt-4"
                  onClick={() => setLightbox(null)}
                  style={{ display: 'block', margin: '1rem auto 0', padding: '0.5rem 2rem' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
