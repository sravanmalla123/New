import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--navy-light)',
      borderTop: '1px solid var(--glass-border)',
      marginTop: '3.5rem'
    }}>
      {/* Main Footer */}
      <div className="container" style={{ padding: '3.5rem 1.5rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="var(--primary)" strokeWidth="2"/>
                <path d="M18 6L22 14H30L24 19L26 27L18 22L10 27L12 19L6 14H14L18 6Z" fill="var(--primary)"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                  Adarsh Gram Portal
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Government of India</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.7', marginBottom: '1rem' }}>
              Official portal for the Pradhan Mantri Adarsh Gram Yojana, 
              tracking development of SC-majority villages across India.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-saffron">26 States</span>
              <span className="badge badge-green">47,000+ Villages</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--white)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Quick Links
            </h4>
            {[
              { label: 'Home', path: '/' },
              { label: 'About Scheme', path: '/about' },
              { label: 'Village List', path: '/villages' },
              { label: 'Gallery', path: '/gallery' },
              { label: 'Reports & Statistics', path: '/reports' },
              { label: 'Partner With Us', path: '/partner' },
            ].map(l => (
              <Link key={l.label} to={l.path} style={{
                display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem',
                padding: '0.25rem 0', transition: 'color 0.2s', textDecoration: 'none'
              }}
              onMouseEnter={e => e.target.style.color = 'var(--primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                ↗ {l.label}
              </Link>
            ))}
          </div>

          {/* Reports */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--white)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Reports
            </h4>
            {[
              { label: 'Village Statistics', path: '/reports' },
              { label: 'Fund Released', path: '/reports#funds' },
              { label: 'VDP Status', path: '/reports#vdp' },
              { label: 'Downloads', path: '/downloads' },
              { label: 'Contact Us', path: '/contact' },
            ].map(l => (
              <Link key={l.label} to={l.path} style={{
                display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem',
                padding: '0.25rem 0', transition: 'color 0.2s', textDecoration: 'none'
              }}
              onMouseEnter={e => e.target.style.color = 'var(--primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
                ↗ {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--white)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Contact
            </h4>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.8' }}>
              <p>Department of Social Justice & Empowerment</p>
              <p>Ministry of Social Justice</p>
              <p>New Delhi - 110001</p>
              <p style={{ marginTop: '0.75rem' }}>📧 support@adarshgram.gov.in</p>
              <p>📞 1800-11-0001 (Toll Free)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid var(--glass-border)',
        padding: '1.25rem 1.5rem',
        background: 'rgba(0,0,0,0.1)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © {year} Adarsh Gram Development Portal | Government of India. All Rights Reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms & Conditions', 'Sitemap', 'Disclaimer'].map(l => (
              <a key={l} href="#" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                {l}
              </a>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', opacity: 0.7, fontSize: '0.75rem' }}>
            Designed & Developed by NIC | Best viewed in Chrome, Firefox, Edge
          </p>
        </div>
      </div>
    </footer>
  );
}
