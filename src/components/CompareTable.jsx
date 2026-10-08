import React from 'react';
import { Award, AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function CompareTable({ allSol, currentSolver, budget, onJumpToTheory }) {
  if (!allSol) return null;

  const dp = allSol.dp;
  const bb = allSol.backtracking;
  const greedy = allSol.greedy;

  return (
    <div className="bento-card compare-results-card">
      <div className="bento-card-header">
        <div className="header-title">
          <Award size={18} color="#4C4541" />
          <span>Algorithms Performance & Optimality Benchmark</span>
        </div>
        {onJumpToTheory && (
          <button
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.74rem', padding: '0.2rem 0.55rem' }}
            onClick={() => {
              sounds.playClick();
              onJumpToTheory();
            }}
          >
            Mathematical Proofs <ArrowUpRight size={13} />
          </button>
        )}
      </div>

      {/* Greedy Failure Trap Alert */}
      {greedy && greedy.rewardGapPct > 5 && (
        <div className="greedy-warning-banner">
          <AlertTriangle size={18} color="#4C4541" style={{ flexShrink: 0 }} />
          <div>
            <strong>⚠️ Greedy Heuristic Suboptimality:</strong> Greedy missed the global maximum reward by{' '}
            <strong>-{greedy.rewardGapPct.toFixed(1)}%</strong> ({greedy.totalReward} vs {allSol.optimalReward} optimal points). Greedy consumed the budget on nearby low-value stops!
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="comparison-table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Total Reward (Max ∑ rᵢ)</th>
              <th>Time Used / Budget</th>
              <th>Runtime</th>
              <th>Nodes / States</th>
              <th>Memory</th>
              <th>Optimality Gap</th>
            </tr>
          </thead>
          <tbody>
            {/* DP Row */}
            {dp ? (
              <tr className={currentSolver === 'dp' ? 'active-row dp' : ''}>
                <td>
                  <span className="algo-badge badge-dp">Bitmask DP</span>
                </td>
                <td className="highlight-val">
                  +{dp.totalReward} Points
                </td>
                <td>{dp.timeUsed.toFixed(1)}m / {budget}m</td>
                <td>{dp.runtimeMs.toFixed(2)} ms</td>
                <td>{dp.nodesExplored.toLocaleString()} states</td>
                <td>{dp.memoryEstimate}</td>
                <td>
                  <span className="badge badge-success">
                    <CheckCircle2 size={11} /> 0.00% (Optimal)
                  </span>
                </td>
              </tr>
            ) : allSol.dpError ? (
              <tr>
                <td><span className="algo-badge badge-dp">Bitmask DP</span></td>
                <td colSpan={6} style={{ color: '#4C4541' }}>{allSol.dpError}</td>
              </tr>
            ) : null}

            {/* B&B Row */}
            {bb ? (
              <tr className={currentSolver === 'backtracking' ? 'active-row bb' : ''}>
                <td>
                  <span className="algo-badge badge-bb">{bb.name}</span>
                </td>
                <td className="highlight-val">
                  +{bb.totalReward} Points
                </td>
                <td>{bb.timeUsed.toFixed(1)}m / {budget}m</td>
                <td>{bb.runtimeMs.toFixed(2)} ms</td>
                <td>{bb.nodesExplored.toLocaleString()} nodes</td>
                <td>{bb.memoryEstimate}</td>
                <td>
                  {bb.rewardGapPct > 0 ? (
                    <span className="badge badge-danger">-{bb.rewardGapPct.toFixed(2)}%</span>
                  ) : (
                    <span className="badge badge-success"><CheckCircle2 size={11} /> 0.00% (Optimal)</span>
                  )}
                </td>
              </tr>
            ) : allSol.bbError ? (
              <tr>
                <td><span className="algo-badge badge-bb">Branch & Bound</span></td>
                <td colSpan={6} style={{ color: '#4C4541' }}>{allSol.bbError}</td>
              </tr>
            ) : null}

            {/* Greedy Row */}
            {greedy && (
              <tr className={currentSolver === 'greedy' ? 'active-row greedy' : ''}>
                <td>
                  <span className="algo-badge badge-greedy">Greedy Ratio</span>
                </td>
                <td className="highlight-val">
                  +{greedy.totalReward} Points
                </td>
                <td>{greedy.timeUsed.toFixed(1)}m / {budget}m</td>
                <td>{greedy.runtimeMs.toFixed(3)} ms</td>
                <td>{greedy.nodesExplored.toLocaleString()} checks</td>
                <td>{greedy.memoryEstimate}</td>
                <td>
                  {greedy.rewardGapPct > 0 ? (
                    <span className="badge badge-warning">-{greedy.rewardGapPct.toFixed(1)}% Suboptimal</span>
                  ) : (
                    <span className="badge badge-success">0.00%</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
