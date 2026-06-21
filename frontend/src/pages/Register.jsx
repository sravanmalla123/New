import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AREAS = ['Infrastructure', 'Education', 'Health', 'Technology', 'Agriculture', 'Women Empowerment', 'Skill Development', 'Water & Sanitation', 'Solar Energy', 'Road Construction'];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    org_name: '', org_type: 'University', email: '', phone: '', address: '',
    city: '', state: '', pincode: '', contact_person: '', contact_designation: '',
    areas_of_interest: [], proposed_contribution: '', student_count: '', faculty_count: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleArea = (a) => set('areas_of_interest', form.areas_of_interest.includes(a) ? form.areas_of_interest.filter(x => x !== a) : [...form.areas_of_interest, a]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/applications', { ...form, areas_of_interest: form.areas_of_interest.join(', ') });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--white)', marginBottom: '0.75rem' }}>
          Application Submitted!
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.7' }}>
          Thank you for applying to partner with Adarsh Gram. Our team will review your application 
          and contact you within 5-7 business days. Upon approval, you will receive login credentials 
          to upload project progress images.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Partner With Us</span>
          </div>
          <h1>🎓 Academic Partnership Program</h1>
          <p>Apply to collaborate on Adarsh Gram village development projects</p>
        </div>
      </div>

      <div className="section-sm">
        <div className="container" style={{ maxWidth: '760px' }}>
          {/* Step Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  onClick={() => s < step && setStep(s)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: s <= step ? 'var(--primary)' : 'var(--navy-mid)',
                    color: s <= step ? 'var(--navy)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: s < step ? 'pointer' : 'default',
                    transition: 'all 0.3s',
                    justifyContent: 'center'
                  }}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div style={{ width: '60px', height: '2px', background: s < step ? 'var(--primary)' : 'var(--glass-border)', transition: 'background 0.3s' }}></div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginBottom: '2rem' }}>
            {['Organization Details', 'Contact & Address', 'Contribution Plan'].map((l, i) => (
              <span key={l} style={{ fontSize: '0.75rem', color: i + 1 === step ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                {l}
              </span>
            ))}
          </div>

          <div className="card" style={{ background: 'var(--navy-card)' }}>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
                    Organization Details
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Organization Name *</label>
                      <input type="text" className="form-control" placeholder="e.g., IIT Bombay" required value={form.org_name} onChange={e => set('org_name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Organization Type *</label>
                      <select className="form-control" value={form.org_type} onChange={e => set('org_type', e.target.value)}>
                        <option>University</option>
                        <option>College</option>
                        <option>Technical Institute</option>
                        <option>Research Institute</option>
                        <option>Medical College</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Official Email *</label>
                      <input type="email" className="form-control" placeholder="info@university.edu.in" required value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input type="tel" className="form-control" placeholder="9876543210" required value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Number of Students</label>
                      <input type="number" className="form-control" placeholder="5000" value={form.student_count} onChange={e => set('student_count', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Number of Faculty</label>
                      <input type="number" className="form-control" placeholder="250" value={form.faculty_count} onChange={e => set('faculty_count', e.target.value)} />
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary w-full" onClick={() => { if (!form.org_name || !form.email || !form.phone) { setError('Please fill all required fields'); return; } setError(''); setStep(2); }}>
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
                    Contact & Address
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Contact Person *</label>
                      <input type="text" className="form-control" placeholder="Dr. Full Name" required value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input type="text" className="form-control" placeholder="Dean, CSR Head, etc." value={form.contact_designation} onChange={e => set('contact_designation', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" rows="2" placeholder="Campus address" value={form.address} onChange={e => set('address', e.target.value)}></textarea>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" placeholder="Mumbai" value={form.city} onChange={e => set('city', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" className="form-control" placeholder="Maharashtra" value={form.state} onChange={e => set('state', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code</label>
                    <input type="text" className="form-control" placeholder="400076" value={form.pincode} onChange={e => set('pincode', e.target.value)} style={{ maxWidth: '200px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                    <button type="button" className="btn btn-primary w-full" onClick={() => { if (!form.contact_person) { setError('Contact person is required'); return; } setError(''); setStep(3); }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>
                    Contribution Plan
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Areas of Interest (select all that apply)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {AREAS.map(area => (
                        <button key={area} type="button" onClick={() => toggleArea(area)}
                          className={`btn btn-sm ${form.areas_of_interest.includes(area) ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ borderRadius: '8px', padding: '0.375rem 0.875rem' }}>
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Proposed Contribution</label>
                    <textarea className="form-control" rows="4" placeholder="Describe how your institution plans to contribute to Adarsh Gram village development..." value={form.proposed_contribution} onChange={e => set('proposed_contribution', e.target.value)}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                      {loading ? '⏳ Submitting...' : '🚀 Submit Application'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="alert alert-info mt-6">
            <div>
              <strong>What happens next?</strong><br/>
              After submission, our team reviews your application within 5-7 business days. 
              Approved institutions receive login credentials and can upload project progress images 
              that appear on the homepage gallery carousel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
