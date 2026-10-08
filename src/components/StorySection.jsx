import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  MapPin, 
  Target, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function StorySection({ onJumpToPlayground }) {
  const storyCards = [
    {
      step: '01',
      title: 'The Real-World Dilemma: Why TSP Breaks Down',
      badge: 'The Dilemma',
      color: '#4C4541',
      icon: AlertTriangle,
      content: (
        <div className="story-card-body">
          <p>
            Standard textbooks teach the <strong>Traveling Salesperson Problem (TSP)</strong>, which assumes you <em>must</em> visit every single location on the map.
          </p>
          <div className="story-highlight-box red">
            <strong>❌ The Unrealistic TSP Assumption:</strong>
            <p>
              In real life, a drone with a 30-minute battery, an EV delivery van on an 8-hour shift, or a tourist on a 1-day city pass 
              <strong> cannot visit all 30 attractions</strong>. Time and energy are strictly bounded!
            </p>
          </div>
          <p>
            If you try to run standard TSP under a tight budget, the tour will be hopelessly cut short mid-way, stranding vehicles and forfeiting high-value goals.
          </p>
        </div>
      )
    },
    {
      step: '02',
      title: 'The Orienteering Formulation: Selective Prize Collection',
      badge: 'Inputs & Parameters',
      color: '#F2C46A',
      icon: MapPin,
      content: (
        <div className="story-card-body">
          <p>
            The <strong>Orienteering Problem (OP)</strong> introduces dual trade-offs: <em>Which subset of locations should be selected</em>, and <em>in what sequence should they be visited</em>?
          </p>
          <div className="story-param-grid">
            <div className="param-item">
              <span className="param-title">{"🏁 Depot (v₀)"}</span>
              <span className="param-desc">{"Start and optional return point with (x₀, y₀) coordinates."}</span>
            </div>
            <div className="param-item">
              <span className="param-title">{"💎 Rewards (rᵢ ∈ [1, 10])"}</span>
              <span className="param-desc">{"Score or priority value collected upon visiting location i."}</span>
            </div>
            <div className="param-item">
              <span className="param-title">{"⏱️ Stay Times (sᵢ)"}</span>
              <span className="param-desc">{"Mandatory service or sightseeing queue duration at place i."}</span>
            </div>
            <div className="param-item">
              <span className="param-title">{"⏳ Total Budget (B)"}</span>
              <span className="param-desc">{"Hard ceiling on combined travel time and stay durations."}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      step: '03',
      title: 'The Mathematical Objective: Maximize Reward Under Budget',
      badge: 'Mathematical Model',
      color: '#AEAC78',
      icon: Target,
      content: (
        <div className="story-card-body">
          <p>
            {"The goal is to select an ordered sequence of places P = (p₁, p₂, ..., pₖ) to:"}
          </p>
          <div className="story-formula-card">
            <div className="formula-header">🎯 Objective Function:</div>
            <div className="formula-math">
              {"Maximize ∑ [i=1 to k] Reward(pᵢ)"}
            </div>
            <div className="formula-header" style={{ marginTop: '0.75rem' }}>⛓️ Subject to Budget Constraint:</div>
            <div className="formula-math-sub">
              {"t(v₀, p₁) + s(p₁) + ∑ [i=2..k] (t(p_{i-1}, pᵢ) + s(pᵢ)) + t(pₖ, v₀) ≤ B"}
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            This marries the subset selection of the <strong>0/1 Knapsack Problem</strong> with the permutation spatial cost of <strong>TSP</strong>, creating a challenging NP-hard problem.
          </p>
        </div>
      )
    },
    {
      step: '04',
      title: 'The Three Algorithmic Frontiers',
      badge: 'Solvers Architecture',
      color: '#F2C46A',
      icon: Cpu,
      content: (
        <div className="story-card-body">
          <div className="story-solvers-comparison">
            <div className="solver-preview-box winner">
              <div className="solver-badge"><CheckCircle2 size={13} color="#F2C46A" /> {"Bitmask DP (Θ(n² · 2ⁿ))"}</div>
              <p>{"Memoizes shortest times for all 2ⁿ × n subproblems. Guaranteed global optimal reward."}</p>
            </div>
            <div className="solver-preview-box">
              <div className="solver-badge"><CheckCircle2 size={13} color="#AEAC78" /> {"Branch & Bound (O(n!))"}</div>
              <p>{"Recursive DFS with upper bound and time budget pruning. Exact, but factorially slow for large n."}</p>
            </div>
            <div className="solver-preview-box">
              <div className="solver-badge"><XCircle size={13} color="#4C4541" /> {"Greedy Heuristic (O(n²))"}</div>
              <p>{"Greedily grabs max (Reward / Travel Time) next stop. Fast, but vulnerable to local traps."}</p>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                sounds.playClick();
                onJumpToPlayground();
              }}
            >
              <Sparkles size={15} /> Jump Directly to Interactive Playground
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="story" className="story-section">
      <div className="section-header-centered">
        <div className="section-eyebrow">
          <Sparkles size={14} /> Problem Narrative & Foundations
        </div>
        <h2 className="section-title">
          Understanding the Orienteering Problem
        </h2>
        <p className="section-subtitle">
          Scroll down through the cards to explore why standard algorithms fail and how spatial Dynamic Programming overcomes the combinatorial explosion.
        </p>
      </div>

      {/* Stacking Parallax Cards Container */}
      <div className="story-cards-stack">
        {storyCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.step}
              className="story-stack-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              style={{
                top: `calc(100px + ${idx * 28}px)`
              }}
            >
              <div className="story-card-topbar">
                <div className="story-card-badge">
                  <Icon size={14} />
                  <span>{card.badge}</span>
                </div>
                <span className="story-step-number">{card.step}</span>
              </div>

              <h3 className="story-card-title">{card.title}</h3>
              {card.content}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
