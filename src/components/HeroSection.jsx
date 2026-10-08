import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Play, Sparkles, ArrowDown, MapPin, Gauge, ShieldCheck, Zap, Cpu } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function HeroSection({ onLaunchPlayground }) {
  const containerRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const mouseY = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      layersRef.current.forEach((layer, idx) => {
        if (!layer) return;
        const depth = (idx + 1) * 12;
        layer.style.transform = `translate3d(${mouseX * depth}px, ${mouseY * depth}px, 0)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="hero" className="hero-section" ref={containerRef}>
      
      {/* Parallax Background Topography Layers */}
      <div className="hero-parallax-backdrop">
        <div 
          className="parallax-layer layer-contour" 
          ref={(el) => (layersRef.current[0] = el)} 
        />
        <div 
          className="parallax-layer layer-glow-cyan" 
          ref={(el) => (layersRef.current[1] = el)} 
        />
        <div 
          className="parallax-layer layer-glow-violet" 
          ref={(el) => (layersRef.current[2] = el)} 
        />
        <div 
          className="parallax-layer layer-floating-pins" 
          ref={(el) => (layersRef.current[3] = el)}
        >
          <div className="floating-pin pin-1"><MapPin size={16} color="#F2C46A" /> <span>Summit R=10</span></div>
          <div className="floating-pin pin-2"><MapPin size={16} color="#AEAC78" /> <span>Citadel R=9</span></div>
          <div className="floating-pin pin-3"><MapPin size={16} color="#4C4541" /> <span>Depot v₀</span></div>
          <div className="floating-pin pin-4"><MapPin size={16} color="#AEAC78" /> <span>Tower R=8</span></div>
        </div>
      </div>

      {/* Hero Central Content */}
      <div className="hero-content-wrapper">
        
        {/* Top Tag */}
        <motion.div
          className="hero-badge-pill"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles size={14} color="#4C4541" />
          <span>DAA Project • Selective TSP & Orienteering Problem</span>
        </motion.div>

        {/* Animated Headline with Text Flow Gradient */}
        <motion.h1
          className="hero-main-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Maximize Your Rewards Under <br />
          <span className="text-flow-gradient">Strict Time Budgets</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {"When visiting all destinations is mathematically impossible due to finite time or battery limits, BudgetTrail employs Bitmask Dynamic Programming (Θ(n² · 2ⁿ)) and Branch & Bound to discover the exact global reward-maximizing tour."}
        </motion.p>

        {/* Key Features Metric Grid */}
        <motion.div
          className="hero-metrics-grid"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <div className="hero-metric-card">
            <div className="metric-icon"><Cpu size={18} /></div>
            <div className="metric-data">
              <span className="metric-num">{"Θ(n² · 2ⁿ)"}</span>
              <span className="metric-lbl">Bitmask DP Complexity</span>
            </div>
          </div>

          <div className="hero-metric-card">
            <div className="metric-icon"><ShieldCheck size={18} /></div>
            <div className="metric-data">
              <span className="metric-num">100% Exact</span>
              <span className="metric-lbl">Global Optimality</span>
            </div>
          </div>

          <div className="hero-metric-card">
            <div className="metric-icon"><Zap size={18} /></div>
            <div className="metric-data">
              <span className="metric-num">O(n²) Heuristic</span>
              <span className="metric-lbl">Greedy Ratio Benchmark</span>
            </div>
          </div>

          <div className="hero-metric-card">
            <div className="metric-icon"><Gauge size={18} /></div>
            <div className="metric-data">
              <span className="metric-num">50-Test</span>
              <span className="metric-lbl">In-App Automated Suite</span>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="hero-cta-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            className="btn btn-primary btn-hero-glow"
            onClick={() => {
              sounds.playClick();
              onLaunchPlayground();
            }}
          >
            <Play size={17} fill="currentColor" /> Launch Spatial Playground
          </button>

          <a
            href="#story"
            className="btn btn-outline"
            onClick={() => sounds.playClick()}
          >
            <Compass size={17} /> Explore Problem Story
          </a>
        </motion.div>

      </div>

      {/* Bottom Scroll Indicator */}
      <a href="#story" className="hero-scroll-indicator" onClick={() => sounds.playClick()}>
        <span>SCROLL TO DISCOVER</span>
        <ArrowDown size={14} className="bounce-arrow" />
      </a>

    </section>
  );
}
