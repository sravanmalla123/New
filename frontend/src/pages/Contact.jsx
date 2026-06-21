import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OFFICES = [
  { title: 'Ministry Headquarters', address: 'Room No. 527, D Wing, Shastri Bhawan, New Delhi - 110001', phone: '011-23382498', email: 'support@adarshgram.gov.in', icon: '🏛️' },
  { title: 'NIC Technical Support', address: 'National Informatics Centre, CGO Complex, New Delhi - 110003', phone: '011-24360189', email: 'support-nic@adarshgram.gov.in', icon: '💻' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Contact</span>
          </div>
          <h1>📞 Contact Us</h1>
          <p>Reach out to our team for assistance, feedback, or information</p>
        </div>
      </div>
      <div className="section-sm">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
            {/* Offices */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem', fontSize: '1.5rem' }}>
                Office Addresses
              </h2>
              {OFFICES.map(office => (
                <div key={office.title} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2rem' }}>{office.icon}</div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        {office.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>📍 {office.address}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>📞 {office.phone}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>📧 {office.email}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(20,184,166,0.03))', border: '1px solid var(--primary-glow)' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.75rem' }}>🕐 Working Hours</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Monday – Friday: 9:00 AM – 5:30 PM</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Saturday: 9:00 AM – 1:00 PM</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed on Government Holidays</p>
              </div>

              <div className="card mt-4" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📞</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--saffron)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                  1800-11-0001
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Toll-Free Helpline (9 AM – 6 PM)</p>
              </div>
            </div>

            {/* Feedback Form */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.25rem', fontSize: '1.5rem' }}>
                Send Feedback / Query
              </h2>
              <div className="card" style={{ background: 'var(--navy-card)' }}>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                      Message Sent!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Thank you for your feedback. Our team will respond within 3-5 business days.</p>
                    <button className="btn btn-primary mt-4" onClick={() => setSubmitted(false)}>Send Another Message</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input type="text" className="form-control" required value={form.name} onChange={e => set('name', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input type="email" className="form-control" required value={form.email} onChange={e => set('email', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="tel" className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Subject *</label>
                        <select className="form-control" required value={form.subject} onChange={e => set('subject', e.target.value)}>
                          <option value="">Select subject</option>
                          <option>General Inquiry</option>
                          <option>Village Data Issue</option>
                          <option>Partnership Application</option>
                          <option>Technical Support</option>
                          <option>Fund Related Query</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea
                        className="form-control"
                        rows="5"
                        required
                        placeholder="Please describe your query or feedback in detail..."
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-full">📨 Send Message</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
