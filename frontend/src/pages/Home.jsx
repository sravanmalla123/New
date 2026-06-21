import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Home.css';

/* ---- STATS COUNTER ---- */
function CountUp({ target, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const animate = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  const fmt = (n) => {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + ' Cr';
    if (n >= 100000) return (n / 100000).toFixed(1) + ' L';
    if (n >= 1000) return n.toLocaleString('en-IN');
    return n.toString();
  };

  return <span ref={ref}>{prefix}{fmt(count)}{suffix}</span>;
}

/* ---- CAROUSEL ---- */
function HeroCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, images.length]);

  if (!images.length) {
    return (
      <div className="carousel-placeholder">
        <div className="carousel-placeholder-inner">
          <div className="placeholder-icon">🏘️</div>
          <p>Development progress images will appear here</p>
        </div>
      </div>
    );
  }

  const slide = images[current];
  const imgSrc = slide.filename?.startsWith('placeholder')
    ? null
    : `/uploads/${slide.filename}`;

  return (
    <div className="hero-carousel">
      {images.map((img, i) => (
        <div key={img.id} className={`carousel-slide ${i === current ? 'active' : ''}`}>
          {img.filename && !img.filename.startsWith('placeholder') ? (
            <img src={`/uploads/${img.filename}`} alt={img.title} className="carousel-img" loading="lazy" />
          ) : (
            <div className="carousel-gradient-bg" style={{
              background: `linear-gradient(135deg, hsl(${(i * 60) % 360}, 50%, 15%) 0%, hsl(${(i * 60 + 40) % 360}, 40%, 20%) 100%)`
            }}>
              <div className="carousel-icon-big">{['🏘️', '🌾', '🏫', '💡', '🚰'][i % 5]}</div>
            </div>
          )}
          <div className="carousel-overlay"></div>
          <div className="carousel-caption">
            <span className="carousel-category badge badge-saffron">{img.category || 'Development'}</span>
            <h3 className="carousel-title">{img.title}</h3>
            {img.village_name && (
              <p className="carousel-village">📍 {img.village_name}, {img.village_state}</p>
            )}
            {img.uploader_org && (
              <p className="carousel-uploader">🏫 {img.uploader_org}</p>
            )}
          </div>
        </div>
      ))}

      {/* Controls */}
      <button className="carousel-btn carousel-prev" onClick={prev} aria-label="Previous">‹</button>
      <button className="carousel-btn carousel-next" onClick={next} aria-label="Next">›</button>

      {/* Dots */}
      <div className="carousel-dots">
        {images.map((_, i) => (
          <button key={i} className={`carousel-dot ${i === current ? 'active' : ''}`}
            onClick={() => { setCurrent(i); clearInterval(timerRef.current); }}
            aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

/* ---- NEWS TICKER ---- */
function NewsTicker({ items }) {
  if (!items.length) return null;
  const text = items.map(n => n.title).join('   •   ');
  return (
    <div className="news-ticker">
      <span className="ticker-label">📢 Latest News</span>
      <div className="ticker-track">
        <span className="ticker-content">{text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{text}</span>
      </div>
    </div>
  );
}

/* ---- HOME PAGE ---- */
export default function Home() {
  const [stats, setStats] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/images?show_on_home=true&limit=10'),
      api.get('/stats/news'),
    ]).then(([statsData, imagesData, newsData]) => {
      setStats(statsData);
      setCarouselImages(imagesData.images || []);
      setNews(newsData || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'States Covered', value: stats.villages.states, icon: '🗺️', color: 'saffron' },
    { label: 'Districts', value: stats.villages.districts, icon: '🏛️', color: 'blue' },
    { label: 'Villages', value: stats.villages.total, icon: '🏘️', color: 'green' },
    { label: 'Total Households', value: stats.population.households, icon: '🏠', color: 'saffron' },
    { label: 'Total Population', value: stats.population.total, icon: '👥', color: 'blue' },
    { label: 'SC Population', value: stats.population.sc, icon: '🤝', color: 'green' },
    { label: 'Works Identified', value: stats.works.identified, icon: '📋', color: 'saffron' },
    { label: 'Works Completed', value: stats.works.completed, icon: '✅', color: 'green' },
    { label: 'Adarsh Gram Declared', value: stats.adarsh_gram_declared, icon: '🌟', color: 'saffron' },
    { label: 'VDP Approved', value: stats.vdp_approved, icon: '📄', color: 'blue' },
    { label: 'Funds Released (₹L)', value: Math.round(stats.funds.released / 100000), icon: '💰', color: 'green' },
    { label: 'Partner Institutions', value: stats.applications.approved, icon: '🏫', color: 'saffron' },
  ] : [];

  const features = [
    { icon: '🗺️', title: 'Village Mapping', desc: 'Explore all Adarsh Gram villages across India on an interactive map', link: '/villages' },
    { icon: '📊', title: 'Progress Reports', desc: 'Detailed statistics on development works, funds, and beneficiaries', link: '/reports' },
    { icon: '🏫', title: 'Partner Program', desc: 'Colleges and universities can apply to support village development', link: '/partner' },
    { icon: '📷', title: 'Photo Gallery', desc: 'Visual documentation of development progress across all villages', link: '/gallery' },
    { icon: '📄', title: 'Downloads', desc: 'Access guidelines, forms, circulars, and official documents', link: '/downloads' },
    { icon: '📞', title: 'Contact Us', desc: 'Reach out to state and district nodal officers for assistance', link: '/contact' },
  ];

  return (
    <div className="home-page">
      {/* News Ticker */}
      <NewsTicker items={news} />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
        </div>
        <div className="container hero-grid">
          {/* Left Content */}
          <div className="hero-content animate-fade-up">
            <div className="hero-badge">
              <span className="badge badge-saffron">🇮🇳 Government of India</span>
            </div>
            <h1 className="hero-title">
              Pradhan Mantri<br />
              <span className="text-saffron">Adarsh Gram</span><br />
              <span className="hero-title-sub">Development Portal</span>
            </h1>
            <p className="hero-desc">
              Empowering SC-majority villages across India through integrated development, 
              digital tracking, and institutional partnerships. Bridging the gap between 
              aspiration and achievement.
            </p>
            <div className="hero-actions">
              <Link to="/villages" className="btn btn-primary btn-lg">
                🏘️ Explore Villages
              </Link>
              <Link to="/partner" className="btn btn-secondary btn-lg">
                🏫 Partner With Us
              </Link>
            </div>
            <div className="hero-quick-stats">
              <div className="quick-stat">
                <span className="qs-num text-saffron">{loading ? '...' : '47K+'}</span>
                <span className="qs-label">Villages</span>
              </div>
              <div className="qs-divider"></div>
              <div className="quick-stat">
                <span className="qs-num text-green">{loading ? '...' : '15,915'}</span>
                <span className="qs-label">Adarsh Gram</span>
              </div>
              <div className="qs-divider"></div>
              <div className="quick-stat">
                <span className="qs-num" style={{ color: '#60A5FA' }}>{loading ? '...' : '26'}</span>
                <span className="qs-label">States</span>
              </div>
            </div>
          </div>

          {/* Right Carousel */}
          <div className="hero-carousel-container animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {loading ? (
              <div className="carousel-placeholder"><div className="spinner"></div></div>
            ) : (
              <HeroCarousel images={carouselImages} />
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section stats-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">📊 Implementation Progress</div>
            <h2 className="section-title">Real-Time <span>Statistics</span></h2>
            <p className="section-subtitle">Live tracking of development progress across all Adarsh Gram villages</p>
          </div>
          <div className="stats-grid">
            {loading ? (
              <div className="loading-spinner" style={{ gridColumn: '1/-1' }}><div className="spinner"></div></div>
            ) : statCards.map((stat, i) => (
              <div key={stat.label} className={`stat-card stat-${stat.color}`}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">
                  <CountUp target={stat.value} duration={1500 + i * 100} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">🚀 Portal Features</div>
            <h2 className="section-title">Everything You <span>Need</span></h2>
            <p className="section-subtitle">Comprehensive tools for tracking, reporting, and collaboration</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <Link key={f.title} to={f.link} className="feature-card"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <span className="feature-link">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* College Partnership CTA */}
      <section className="section partnership-section">
        <div className="container">
          <div className="partnership-card">
            <div className="partnership-content">
              <div className="section-label">🎓 Academic Partnership</div>
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                Is Your Institution Ready to<br /><span>Make a Difference?</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Colleges and universities can apply to partner with Adarsh Gram villages. 
                Contribute expertise in infrastructure, education, technology, health, 
                and more. Approved institutions get access to upload progress images 
                that are showcased on the homepage.
              </p>
              <div className="partnership-features">
                {['📋 Submit Application Online', '✅ Get Approved by Admin', '📷 Upload Progress Images', '🏆 Feature on Homepage'].map(f => (
                  <div key={f} className="p-feature">{f}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <Link to="/partner" className="btn btn-primary btn-lg">Apply Now</Link>
                <Link to="/about" className="btn btn-secondary btn-lg">Learn More</Link>
              </div>
            </div>
            <div className="partnership-visual">
              <div className="p-visual-grid">
                {['🏛️ IIT Bombay', '🎓 Pune University', '🔬 NIT Nagpur', '📚 Delhi University', '💻 BITS Pilani', '🏥 AIIMS'].map((inst, i) => (
                  <div key={inst} className="p-inst-card" style={{ animationDelay: `${i * 0.15}s` }}>
                    {inst}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      {news.length > 0 && (
        <section className="section news-section">
          <div className="container">
            <div className="section-header">
              <div className="section-label">📢 Updates</div>
              <h2 className="section-title">Latest <span>News & Announcements</span></h2>
            </div>
            <div className="news-grid">
              {news.slice(0, 6).map((item, i) => (
                <div key={item.id} className={`news-card ${item.is_featured ? 'news-featured' : ''}`}
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  {item.is_featured && <span className="badge badge-saffron mb-2">Featured</span>}
                  <h4 className="news-title">{item.title}</h4>
                  {item.content && <p className="news-content">{item.content}</p>}
                  <div className="news-date">
                    📅 {new Date(item.published_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner">
            <div>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>
                Track Your Village's Progress
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                Search for any Adarsh Gram village and view real-time development indicators
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/villages" className="btn btn-primary btn-lg">🔍 Search Villages</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">🔐 Admin Login</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
