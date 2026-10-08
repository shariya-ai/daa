import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  BookOpen, 
  BarChart3, 
  Cpu, 
  Layers, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Github, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function Navbar({ audioEnabled, setAudioEnabled, onOpenSelfCheck }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { id: 'hero', label: 'Home', icon: Compass },
    { id: 'story', label: 'Problem Story', icon: BookOpen },
    { id: 'playground', label: 'Playground', icon: MapPin },
    { id: 'benchmark', label: 'Benchmark', icon: BarChart3 },
    { id: 'theory', label: 'Theory & Proofs', icon: Cpu },
    { id: 'applications', label: 'Applications', icon: Layers }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ['hero', 'story', 'playground', 'benchmark', 'theory', 'applications'];
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    sounds.playClick();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAudioToggle = () => {
    const state = sounds.toggle();
    setAudioEnabled(state);
    if (state) sounds.playOptimalChime();
  };

  return (
    <>
      <header className={`floating-pill-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-glass-container">
          
          {/* Brand */}
          <div className="nav-brand" onClick={() => scrollToSection('hero')}>
            <div className="nav-brand-icon">
              <Compass size={20} className="brand-compass" />
            </div>
            <div className="nav-brand-text">
              <span className="brand-name">BudgetTrail</span>
              <span className="brand-tag">Orienteering Solver</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-links-desktop" role="tablist">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => scrollToSection(item.id)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="nav-actions">
            {/* Self Check Button */}
            <button
              className="btn btn-selfcheck"
              onClick={() => {
                sounds.playClick();
                onOpenSelfCheck();
              }}
              title="Run 50-Instance Verification Suite (DP vs B&B)"
            >
              <CheckCircle size={14} color="#4C4541" />
              <span>Self-Check (50)</span>
            </button>

            {/* Audio Toggle */}
            <button
              className="nav-icon-btn"
              onClick={handleAudioToggle}
              title={audioEnabled ? 'Mute Audio Synth' : 'Enable Audio Synth'}
              aria-label="Toggle Audio"
            >
              {audioEnabled ? <Volume2 size={16} color="#4C4541" /> : <VolumeX size={16} color="rgba(76,69,65,0.5)" />}
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/shariya-ai/daa.git"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon-btn"
              title="GitHub Repository"
              aria-label="GitHub Repository"
            >
              <Github size={16} />
            </a>

            {/* Mobile Hamburger */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-drawer-content">
            <div className="mobile-drawer-header">
              <div className="nav-brand">
                <Compass size={22} color="#F2C46A" />
                <span className="brand-name">BudgetTrail</span>
              </div>
              <button className="nav-icon-btn" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-links">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                className="mobile-nav-item"
                style={{ color: '#4C4541', borderTop: '1px solid rgba(76,69,65,0.15)', marginTop: '0.5rem' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSelfCheck();
                }}
              >
                <CheckCircle size={18} color="#AEAC78" />
                <span>Run 50-Test Self-Check</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
