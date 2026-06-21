import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  const domains = [
    { icon: '🏗️', title: 'Infrastructure', items: ['Roads & Connectivity', 'Drainage & Sanitation', 'Community Halls', 'Anganwadi Centers'] },
    { icon: '📚', title: 'Education', items: ['Primary & Middle Schools', 'Scholarship Programs', 'Adult Literacy', 'Digital Classrooms'] },
    { icon: '🏥', title: 'Health', items: ['Health Protection Schemes', 'Immunization Drives', 'Sub Health Centers', 'Nutrition Programs'] },
    { icon: '💡', title: 'Livelihood', items: ['Skill Development', 'SHG Formation', 'PMAY-G Housing', 'LPG Connections'] },
    { icon: '🔌', title: 'Basic Amenities', items: ['Electricity Connections', 'Drinking Water', 'Internet Connectivity', 'Solar Energy'] },
    { icon: '🤝', title: 'Social Security', items: ['Old Age Pension', 'Widow Pension', 'Disability Support', 'IHHL (Toilets)'] },
  ];

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>About</span>
          </div>
          <h1>About Adarsh Gram Yojana</h1>
          <p>Integrated development of SC-majority villages across India</p>
        </div>
      </div>

      <div className="section-sm">
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Background */}
          <div className="card mb-6" id="background">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
              📜 Background
            </h2>
            <p style={{ color: 'var(--text-primary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              The Pradhan Mantri Adarsh Gram Yojana (PMAGY) was launched in 2009-10 as a Centrally Sponsored Scheme 
              for integrated development of SC-majority villages. The scheme aims at convergence of all Central and State 
              Government schemes for villages having SC population of more than 50%.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Under PM-AJAY (Pradhan Mantri Anusuchit Jaati Abhyuday Yojana), the scheme was consolidated with other 
              SC welfare schemes in 2021-22 to ensure holistic development of identified villages.
            </p>
          </div>

          {/* Objectives */}
          <div className="card mb-6" id="objectives">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.25rem' }}>
              🎯 Objectives
            </h2>
            {[
              'Integrated development of SC-majority villages through convergence of government schemes',
              'Gap-filling for works not covered under any other scheme to achieve model village status',
              'Improvement in socio-economic indicators of SC families living in identified villages',
              'Ensuring access to basic civic amenities and opportunities for livelihood enhancement',
              'Building capacities of gram panchayats and village development committees',
            ].map((obj, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--saffron)', fontWeight: 800, flexShrink: 0, marginTop: '0.1rem' }}>{i + 1}.</span>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{obj}</p>
              </div>
            ))}
          </div>

          {/* Vision */}
          <div className="card mb-6" id="vision" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(20,184,166,0.03))', border: '1px solid var(--primary-glow)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--saffron)', marginBottom: '1rem' }}>
              🌟 Vision
            </h2>
            <blockquote style={{ borderLeft: '3px solid var(--saffron)', paddingLeft: '1.25rem', margin: 0 }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.8', fontStyle: 'italic' }}>
                "To create model villages with comprehensive infrastructure and socio-economic development, 
                serving as beacons of progress for surrounding villages and inspiring replication across India."
              </p>
            </blockquote>
          </div>

          {/* Domains */}
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem' }}>
            📊 Development Domains & Indicators
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {domains.map(d => (
              <div key={d.title} className="card">
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{d.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  {d.title}
                </h3>
                {d.items.map(item => (
                  <div key={item} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '0.25rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                    ✓ {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="card" style={{ textAlign: 'center', background: 'var(--primary-dim)', border: '1px solid var(--primary-glow)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Want to Contribute?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Academic institutions can partner with Adarsh Gram villages to support development goals
            </p>
            <Link to="/partner" className="btn btn-primary">Apply as Partner Institution</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
