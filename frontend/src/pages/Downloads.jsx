import React from 'react';
import { Link } from 'react-router-dom';

const DOCS = [
  { title: 'PMAGY Guidelines (All Languages)', size: '2.4 MB', type: 'PDF', icon: '📕', desc: 'Official guidelines for scheme implementation' },
  { title: 'Village Development Plan (VDP) Template', size: '1.8 MB', type: 'PDF', icon: '📋', desc: 'Standard format for preparing village development plans' },
  { title: 'District User Manual', size: '3.2 MB', type: 'PDF', icon: '📖', desc: 'Complete user manual for district level officials' },
  { title: 'Format of Utilization Certificate', size: '0.5 MB', type: 'PDF', icon: '📄', desc: 'GFR-12C format for fund utilization reporting' },
  { title: 'Eligibility Criteria', size: '0.8 MB', type: 'PDF', icon: '✅', desc: 'Criteria for village and district eligibility' },
  { title: 'PMAGY Presentation (CSMC Meeting)', size: '4.5 MB', type: 'PDF', icon: '📊', desc: 'Presentation from Central Scheme Monitoring Committee' },
  { title: 'Work Flow for Interim VDP', size: '1.2 MB', type: 'PDF', icon: '🔄', desc: 'Step-by-step workflow for generating interim VDP' },
  { title: 'Announcement Template (Hindi)', size: '0.3 MB', type: 'PDF', icon: '📢', desc: 'Village announcement format in Hindi language' },
  { title: 'Need Assessment Survey Format', size: '1.5 MB', type: 'PDF', icon: '📝', desc: 'Format for conducting household need assessment surveys' },
  { title: 'Sample VDP Document', size: '2.1 MB', type: 'PDF', icon: '🗂️', desc: 'Sample village development plan for reference' },
  { title: 'Sanction Order Format', size: '0.6 MB', type: 'PDF', icon: '📃', desc: 'Standard format for sanction orders' },
  { title: 'Adarsh Gram Logo Pack', size: '1.8 MB', type: 'ZIP', icon: '🎨', desc: 'Official logo in various formats for printing' },
];

export default function Downloads() {
  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Downloads</span>
          </div>
          <h1>📥 Downloads</h1>
          <p>Access official documents, guidelines, forms, and resources</p>
        </div>
      </div>
      <div className="section-sm">
        <div className="container">
          <div className="alert alert-info mb-6">
            📌 These documents are official publications of the Ministry of Social Justice & Empowerment, Government of India.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {DOCS.map((doc, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>{doc.icon}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--white)' }}>
                    {doc.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{doc.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{doc.type}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', alignSelf: 'center' }}>{doc.size}</span>
                    </div>
                    <button className="btn btn-sm btn-secondary" style={{ borderRadius: '8px', fontSize: '0.78rem' }}>
                      ⬇ Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-8" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(20,184,166,0.03))', border: '1px solid var(--primary-glow)', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--white)' }}>
              Need a Document Not Listed Here?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Contact the Web Information Manager or reach out via our contact form
            </p>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
