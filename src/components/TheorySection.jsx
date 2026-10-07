import React, { useState } from 'react';
import { THEORY_DATA } from '../data/theoryData';
import { 
  BookOpen, 
  Cpu, 
  Clock, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Sparkles,
  Calculator,
  Scale
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function TheorySection() {
  const [activeCodeTab, setActiveCodeTab] = useState('dp'); // 'dp' | 'bb' | 'greedy'
  const [openAccordions, setOpenAccordions] = useState({
    definition: true,
    tsp_knapsack: true,
    complexity: true,
    pseudocode: true,
    decision_matrix: true
  });

  const toggleAccordion = (key) => {
    sounds.playClick();
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="theory" className="theory-minimal-section">
      
      {/* Section Header */}
      <div className="section-header-centered">
        <div className="section-eyebrow">
          <BookOpen size={14} /> Mathematical Rigor & Academic Defense
        </div>
        <h2 className="section-title">
          Theoretical Foundations & Complexity Proofs
        </h2>
        <p className="section-subtitle">
          Formal mathematical derivations of time and space complexity, recurrence formulations, and algorithmic comparisons for the Orienteering Problem.
        </p>
      </div>

      <div className="theory-accordion-stack">
        
        {/* Accordion 1: Problem Definition */}
        <div className="minimal-accordion-card">
          <div className="minimal-accordion-header" onClick={() => toggleAccordion('definition')}>
            <div className="header-left">
              <span className="minimal-step-num">01</span>
              <div>
                <h3 className="minimal-header-title">Formal Problem Definition</h3>
                <span className="minimal-badge-tag">NP-Hard Combinatorial Problem</span>
              </div>
            </div>
            {openAccordions.definition ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {openAccordions.definition && (
            <div className="minimal-accordion-body">
              <pre className="minimal-math-block">
                {THEORY_DATA.problemDefinition.description}
              </pre>
            </div>
          )}
        </div>

        {/* Accordion 2: Difference from TSP and Knapsack */}
        <div className="minimal-accordion-card">
          <div className="minimal-accordion-header" onClick={() => toggleAccordion('tsp_knapsack')}>
            <div className="header-left">
              <span className="minimal-step-num">02</span>
              <div>
                <h3 className="minimal-header-title">How OP Differs from TSP and 0/1 Knapsack</h3>
                <span className="minimal-badge-tag">Comparative Taxonomy</span>
              </div>
            </div>
            {openAccordions.tsp_knapsack ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {openAccordions.tsp_knapsack && (
            <div className="minimal-accordion-body">
              <div className="taxonomy-grid">
                {THEORY_DATA.differenceFromClassicProblems.map((prob) => (
                  <div key={prob.name} className="taxonomy-card">
                    <h4 className="taxonomy-title">{prob.name}</h4>
                    <div className="taxonomy-row"><strong>Nature:</strong> {prob.nature}</div>
                    <div className="taxonomy-row"><strong>Objective:</strong> {prob.objective}</div>
                    <div className="taxonomy-row"><strong>Constraint:</strong> {prob.constraint}</div>
                    <div className="taxonomy-contrast">
                      <strong>Key Insight:</strong> {prob.contrast}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Complexity Derivations */}
        <div className="minimal-accordion-card">
          <div className="minimal-accordion-header" onClick={() => toggleAccordion('complexity')}>
            <div className="header-left">
              <span className="minimal-step-num">03</span>
              <div>
                <h3 className="minimal-header-title">Step-by-Step Derivation of Time & Space Complexity</h3>
                <span className="minimal-badge-tag">Asymptotic Proofs</span>
              </div>
            </div>
            {openAccordions.complexity ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {openAccordions.complexity && (
            <div className="minimal-accordion-body">
              <div className="derivations-grid">
                
                {/* Time Derivation */}
                <div className="derivation-unit">
                  <h4 className="derivation-heading" style={{ color: '#00f2fe' }}>
                    <Clock size={16} /> 1. Time Complexity: {THEORY_DATA.complexityDerivations.time.formula}
                  </h4>
                  <ol className="derivation-list">
                    {THEORY_DATA.complexityDerivations.time.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Space Derivation */}
                <div className="derivation-unit">
                  <h4 className="derivation-heading" style={{ color: '#8b5cf6' }}>
                    <Cpu size={16} /> 2. Space Complexity: {THEORY_DATA.complexityDerivations.space.formula}
                  </h4>
                  <ol className="derivation-list">
                    {THEORY_DATA.complexityDerivations.space.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Accordion 4: Clean Algorithms Pseudocode */}
        <div className="minimal-accordion-card">
          <div className="minimal-accordion-header" onClick={() => toggleAccordion('pseudocode')}>
            <div className="header-left">
              <span className="minimal-step-num">04</span>
              <div>
                <h3 className="minimal-header-title">Algorithm Pseudocode for the Three Approaches</h3>
                <span className="minimal-badge-tag">Presentation-Ready Code</span>
              </div>
            </div>
            {openAccordions.pseudocode ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {openAccordions.pseudocode && (
            <div className="minimal-accordion-body">
              <div className="code-tabs-strip">
                <button
                  className={`code-tab-pill ${activeCodeTab === 'dp' ? 'active' : ''}`}
                  onClick={() => setActiveCodeTab('dp')}
                >
                  1. Bitmask DP Recurrence
                </button>
                <button
                  className={`code-tab-pill ${activeCodeTab === 'bb' ? 'active' : ''}`}
                  onClick={() => setActiveCodeTab('bb')}
                >
                  2. Branch & Bound with Pruning
                </button>
                <button
                  className={`code-tab-pill ${activeCodeTab === 'greedy' ? 'active' : ''}`}
                  onClick={() => setActiveCodeTab('greedy')}
                >
                  3. Greedy Ratio Heuristic
                </button>
              </div>

              <pre className="minimal-code-view">
                {activeCodeTab === 'dp' && THEORY_DATA.pseudocode.dp}
                {activeCodeTab === 'bb' && THEORY_DATA.pseudocode.bb}
                {activeCodeTab === 'greedy' && THEORY_DATA.pseudocode.greedy}
              </pre>
            </div>
          )}
        </div>

        {/* Accordion 5: Head-to-Head Decision Matrix */}
        <div className="minimal-accordion-card">
          <div className="minimal-accordion-header" onClick={() => toggleAccordion('decision_matrix')}>
            <div className="header-left">
              <span className="minimal-step-num">05</span>
              <div>
                <h3 className="minimal-header-title">Decision Matrix: Why DP is the Best Choice</h3>
                <span className="minimal-badge-tag">Strategic Justification</span>
              </div>
            </div>
            {openAccordions.decision_matrix ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {openAccordions.decision_matrix && (
            <div className="minimal-accordion-body">
              <div className="decision-matrix-table-wrap">
                <table className="decision-matrix-table">
                  <thead>
                    <tr>
                      <th>Evaluation Metric</th>
                      <th style={{ color: '#00f2fe' }}>Bitmask Dynamic Programming</th>
                      <th style={{ color: '#8b5cf6' }}>Branch & Bound</th>
                      <th style={{ color: '#f59e0b' }}>Greedy Ratio Heuristic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Reward Optimality</strong></td>
                      <td style={{ color: '#00f2fe', fontWeight: 700 }}>✅ 100% Exact Global Maximum</td>
                      <td style={{ color: '#8b5cf6', fontWeight: 700 }}>✅ 100% Exact Global Maximum</td>
                      <td style={{ color: '#ef4444' }}>❌ Suboptimal (10-40% Reward Gap)</td>
                    </tr>
                    <tr>
                      <td><strong>Time Complexity</strong></td>
                      <td>$\Theta(n^2 \cdot 2^n)$</td>
                      <td>$O(n!)$ worst-case</td>
                      <td>$O(n^2)$</td>
                    </tr>
                    <tr>
                      <td><strong>Space Complexity</strong></td>
                      <td>$\Theta(n \cdot 2^n)$</td>
                      <td>$O(n)$ Call Stack</td>
                      <td>$O(n)$</td>
                    </tr>
                    <tr>
                      <td><strong>Runtime Predictability</strong></td>
                      <td style={{ color: '#00f2fe' }}>✅ Deterministic (No spikes)</td>
                      <td style={{ color: '#ef4444' }}>❌ Highly erratic ($O(n!)$ traps)</td>
                      <td style={{ color: '#00f2fe' }}>✅ Instant (&lt; 1 ms)</td>
                    </tr>
                    <tr>
                      <td><strong>Subproblem Memoization</strong></td>
                      <td style={{ color: '#00f2fe' }}>✅ Optimal ($2^n \times n$ table)</td>
                      <td style={{ color: '#ef4444' }}>❌ Redundant subtree recalculations</td>
                      <td>N/A (No subproblems)</td>
                    </tr>
                    <tr>
                      <td><strong>Optimal Use Case</strong></td>
                      <td style={{ color: '#00f2fe', fontWeight: 800 }}>🏆 Day-Tours & Drone Sorties ($n \le 17$)</td>
                      <td>Academic demonstration ($n \le 12$)</td>
                      <td>Mega-fleets ($n &gt; 100$)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

    </section>
  );
}
