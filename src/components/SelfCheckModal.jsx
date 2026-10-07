import React, { useState } from 'react';
import { OrienteeringSolvers } from '../algorithms/solvers';
import { CheckCircle2, XCircle, Play, X, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export function SelfCheckModal({ isOpen, onClose }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  if (!isOpen) return null;

  const handleRunSuite = async () => {
    setIsRunning(true);
    setProgress(0);
    sounds.playClick();

    // Run tests in chunks with yielding to avoid locking UI
    const totalTests = 50;
    const testRecords = [];
    let passed = 0;
    let failed = 0;

    for (let i = 1; i <= totalTests; i++) {
      await new Promise((r) => setTimeout(r, 12));
      setProgress(Math.round((i / totalTests) * 100));

      const n = Math.floor(Math.random() * 4) + 3; // 3 to 6 places
      const speed = Math.floor(Math.random() * 40) + 60;
      const budget = Math.floor(Math.random() * 150) + 90;
      const returnToStart = Math.random() > 0.3;

      const depot = { x: 250, y: 200, name: 'Depot' };
      const places = [];
      for (let j = 0; j < n; j++) {
        places.push({
          id: j + 1,
          name: `P#${j + 1}`,
          x: Math.floor(50 + Math.random() * 400),
          y: Math.floor(50 + Math.random() * 300),
          reward: Math.floor(Math.random() * 10) + 1,
          stayTime: Math.floor(Math.random() * 15) + 5
        });
      }

      const dpRes = OrienteeringSolvers.solveDP(depot, places, speed, budget, returnToStart);
      const bbRes = OrienteeringSolvers.solveBacktracking(depot, places, speed, budget, returnToStart, true);
      const greedyRes = OrienteeringSolvers.solveGreedy(depot, places, speed, budget, returnToStart);

      const isMatch = dpRes.totalReward === bbRes.totalReward && dpRes.timeUsed <= budget + 1e-4;

      if (isMatch) passed++;
      else failed++;

      testRecords.push({
        id: i,
        n,
        budget,
        returnToStart,
        dpReward: dpRes.totalReward,
        bbReward: bbRes.totalReward,
        greedyReward: greedyRes.totalReward,
        dpTime: dpRes.timeUsed,
        bbTime: bbRes.timeUsed,
        passed: isMatch
      });

      setResults({
        total: i,
        passed,
        failed,
        allPassed: failed === 0,
        details: [...testRecords]
      });
    }

    setIsRunning(false);
    if (failed === 0) {
      sounds.playOptimalChime();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-spatial-card" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-top-bar">
          <div className="modal-title-box">
            <div className="modal-icon-glow">
              <ShieldCheck size={20} color="#10b981" />
            </div>
            <div>
              <h3 className="modal-title">Self-Check Verification Suite (50 Automated Tests)</h3>
              <p className="modal-subtitle">Generates 50 random problem instances and proves that Bitmask DP and Branch & Bound output identical global optimal rewards.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body-content">
          
          {/* Action Ribbon */}
          <div className="selfcheck-action-bar">
            <button
              className="btn btn-primary"
              onClick={handleRunSuite}
              disabled={isRunning}
            >
              {isRunning ? <RefreshCw size={15} className="spin-icon" /> : <Play size={15} fill="currentColor" />}
              {isRunning ? `Running Tests (${progress}%)...` : results ? 'Re-Run 50 Tests' : 'Execute 50-Test Verification'}
            </button>

            {results && (
              <div className="selfcheck-stat-badge">
                {results.allPassed ? (
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                    <CheckCircle2 size={15} /> 50 / 50 PASSED (100% Exact DP & B&B Match)
                  </span>
                ) : (
                  <span className="badge badge-danger">
                    <XCircle size={15} /> {results.failed} Tests Mismatched
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="selfcheck-progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* Results Table */}
          {results && (
            <div className="selfcheck-table-container">
              <table className="selfcheck-table">
                <thead>
                  <tr>
                    <th>Test #</th>
                    <th>Places (n)</th>
                    <th>Budget</th>
                    <th>DP Reward</th>
                    <th>B&B Reward</th>
                    <th>Greedy Reward</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.details.map((t) => (
                    <tr key={t.id}>
                      <td><strong>#{t.id}</strong></td>
                      <td>n = {t.n}</td>
                      <td>{t.budget}m</td>
                      <td style={{ color: '#00f2fe', fontWeight: 700 }}>+{t.dpReward}</td>
                      <td style={{ color: '#8b5cf6', fontWeight: 700 }}>+{t.bbReward}</td>
                      <td style={{ color: '#f59e0b' }}>+{t.greedyReward}</td>
                      <td>
                        {t.passed ? (
                          <span className="badge badge-success"><CheckCircle2 size={11} /> MATCH</span>
                        ) : (
                          <span className="badge badge-danger"><XCircle size={11} /> FAIL</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!results && !isRunning && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              Click <strong>"Execute 50-Test Verification"</strong> to launch the automated randomized test suite.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
