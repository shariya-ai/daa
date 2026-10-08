import React from 'react';
import { Compass, ArrowUp, Github, Keyboard } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function Footer() {
  const scrollToTop = () => {
    sounds.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="spatial-footer">
      
      {/* Infinite Text Flow Marquee */}
      <div className="footer-marquee-strip">
        <div className="footer-marquee-text">
          <span>BUDGETTRAIL</span> • <span>ORIENTEERING PROBLEM SOLVER</span> • <span>BITMASK DYNAMIC PROGRAMMING</span> • <span>BRANCH & BOUND</span> • <span>GREEDY RATIO</span> • <span>MAXIMIZE REWARDS UNDER BUDGET</span> • <span>DAA CIA PROJECT</span> • 
          <span>BUDGETTRAIL</span> • <span>ORIENTEERING PROBLEM SOLVER</span> • <span>BITMASK DYNAMIC PROGRAMMING</span> • <span>BRANCH & BOUND</span> • <span>GREEDY RATIO</span> • <span>MAXIMIZE REWARDS UNDER BUDGET</span> • <span>DAA CIA PROJECT</span> • 
        </div>
      </div>

      <div className="footer-content-inner">
        
        {/* Left Brand info */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <Compass size={24} color="#4C4541" />
            <span className="footer-brand-name">BudgetTrail</span>
          </div>
          <p className="footer-tagline">
            Spatial optimization and selective prize-collecting route planning under hard time and battery limits.
          </p>
          <div className="footer-github-link">
            <a
              href="https://github.com/shariya-ai/daa.git"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              <Github size={15} /> GitHub Repository
            </a>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="footer-shortcuts-card">
          <div className="shortcuts-title">
            <Keyboard size={15} color="#4C4541" />
            <span>Keyboard Shortcuts</span>
          </div>
          <div className="shortcuts-grid">
            <div className="shortcut-unit"><kbd>Space</kbd> <span>Play / Pause</span></div>
            <div className="shortcut-unit"><kbd>1</kbd> <span>Bitmask DP</span></div>
            <div className="shortcut-unit"><kbd>2</kbd> <span>Branch & Bound</span></div>
            <div className="shortcut-unit"><kbd>3</kbd> <span>Greedy Ratio</span></div>
            <div className="shortcut-unit"><kbd>C</kbd> <span>Overlay Compare</span></div>
            <div className="shortcut-unit"><kbd>R</kbd> <span>Randomize Map</span></div>
          </div>
        </div>

        {/* Back to Top */}
        <div className="footer-back-col">
          <button className="back-to-top-btn" onClick={scrollToTop} title="Scroll to Top">
            <ArrowUp size={20} />
            <span>TOP</span>
          </button>
        </div>

      </div>

      <div className="footer-bottom-bar">
        <span>Design and Algorithm Analysis Project • Built with React 18, Vite, Framer Motion & GSAP</span>
        <span className="footer-badge">100% Client-Side Pure JS</span>
      </div>

    </footer>
  );
}
