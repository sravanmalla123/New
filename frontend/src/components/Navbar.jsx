import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  {
    label: 'About',
    path: '/about',
    children: [
      { label: 'About Scheme', path: '/about' },
      { label: 'Background', path: '/about#background' },
      { label: 'Objectives', path: '/about#objectives' },
      { label: 'Vision', path: '/about#vision' },
    ]
  },
  {
    label: 'Reports',
    path: '/reports',
    children: [
      { label: 'Village Statistics', path: '/reports' },
      { label: 'Fund Released', path: '/reports#funds' },
      { label: 'VDP Status', path: '/reports#vdp' },
      { label: 'Top Districts', path: '/reports#districts' },
    ]
  },
  { label: 'Villages', path: '/villages' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Downloads', path: '/downloads' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} ref={navRef}>
      {/* Top Bar */}
      <div className="navbar-topbar">
        <div className="container flex items-center justify-between">
          <span className="topbar-text">
            🏛️ Ministry of Social Justice & Empowerment | Government of India
          </span>
          <div className="topbar-links">
            <a href="https://socialjustice.gov.in/" target="_blank" rel="noopener noreferrer">SJ&E Ministry</a>
            <span>|</span>
            <a href="#">Skip to Content</a>
            <span>|</span>
            <a href="#">Screen Reader</a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="navbar-main">
        <div className="container flex items-center justify-between" style={{ gap: '1rem' }}>
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-emblem">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="var(--saffron)" strokeWidth="2"/>
                <path d="M18 6L22 14H30L24 19L26 27L18 22L10 27L12 19L6 14H14L18 6Z" fill="var(--saffron)"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-main">Adarsh Gram</span>
              <span className="logo-sub">Development Portal</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="nav-item"
                onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                onMouseLeave={() => link.children && setOpenDropdown(null)}>
                <NavLink to={link.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {link.label}
                  {link.children && <span className="nav-arrow">▾</span>}
                </NavLink>
                {link.children && openDropdown === link.label && (
                  <div className="nav-dropdown">
                    {link.children.map(child => (
                      <Link key={child.label} to={child.path} className="dropdown-item"
                        onClick={() => setOpenDropdown(null)}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="navbar-auth">
            {user ? (
              <div className="nav-item user-menu"
                onMouseEnter={() => setOpenDropdown('user')}
                onMouseLeave={() => setOpenDropdown(null)}>
                <button className="user-btn">
                  <div className="user-avatar">{user.name?.charAt(0)}</div>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                  <span className="nav-arrow">▾</span>
                </button>
                {openDropdown === 'user' && (
                  <div className="nav-dropdown">
                    <Link to="/admin" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      📊 Dashboard
                    </Link>
                    <Link to="/admin/upload" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                      📷 Upload Images
                    </Link>
                    {isAdmin && (
                      <>
                        <Link to="/admin/applications" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                          📋 Applications
                        </Link>
                        <Link to="/admin/villages" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                          🏘️ Manage Villages
                        </Link>
                      </>
                    )}
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.25rem 0' }} />
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/partner" className="btn btn-primary btn-sm">Partner With Us</Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(link => (
            <div key={link.label}>
              <Link to={link.path} className="mobile-link" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
              {link.children && link.children.map(child => (
                <Link key={child.label} to={child.path} className="mobile-link mobile-sub" onClick={() => setMobileOpen(false)}>
                  └ {child.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mobile-auth">
            {user ? (
              <>
                <Link to="/admin" className="mobile-link" onClick={() => setMobileOpen(false)}>📊 Dashboard</Link>
                <button className="btn btn-danger btn-sm w-full mt-2" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/partner" className="btn btn-primary w-full mt-2" onClick={() => setMobileOpen(false)}>Partner With Us</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
