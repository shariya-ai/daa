import React, { useState, useEffect, useRef } from 'react';
import { OrienteeringSolvers } from '../algorithms/solvers';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Cpu, X, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function DPStepThroughModal({ isOpen, onClose, depot, places, speed, budget, returnToStart, onLoadPreset }) {
  const [history, setHistory] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState(700);
  const timerRef = useRef(null);

  const n = places.length;
  const isTooLarge = n > 5;

  useEffect(() => {
    if (!isOpen || isTooLarge || n === 0) {
      setHistory([]);
      setStepIdx(0);
      return;
    }

    const res = OrienteeringSolvers.solveDP(depot, places, speed, budget, returnToStart, true);
    setHistory(res.stepHistory || []);
    setStepIdx(0);
  }, [isOpen, depot, places, speed, budget, returnToStart, isTooLarge, n]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((prev) => {
          if (prev < history.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeedMs);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackSpeedMs, history.length]);

  if (!isOpen) return null;

  const handleStepForward = () => {
    if (stepIdx < history.length - 1) {
      sounds.playClick();
      setStepIdx(stepIdx + 1);
    }
  };

  const handleStepBackward = () => {
    if (stepIdx > 0) {
      sounds.playClick();
      setStepIdx(stepIdx - 1);
    }
  };

  const handleReset = () => {
    sounds.playClick();
    setIsPlaying(false);
    setStepIdx(0);
  };

  const handleJumpToEnd = () => {
    sounds.playClick();
    setIsPlaying(false);
    if (history.length > 0) setStepIdx(history.length - 1);
  };

  const handleTogglePlay = () => {
    sounds.playClick();
    setIsPlaying(!isPlaying);
  };

  const curStep = history[stepIdx] || {};
  const numStates = 1 << n;

  const cellValues = {};
  for (let s = 0; s <= stepIdx; s++) {
    const item = history[s];
    if (item) {
      cellValues[`${item.mask}-${item.last}`] = item.accumulatedTime;
    }
  }

  const maskToSetNotation = (mask) => {
    const arr = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) arr.push(i + 1);
    }
    return `{${arr.join(', ')}}`;
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="modal-spatial-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-top-bar">
          <div className="modal-title-box">
            <div className="modal-icon-glow">
              <Cpu size={20} color="#4C4541" />
            </div>
            <div>
              <h3 className="modal-title">Bitmask DP Step-Through Matrix Visualizer</h3>
              <p className="modal-subtitle">{"State: DP[mask][last] — Minimum time to visit subset mask ending at last"}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close Visualizer">
            <X size={18} />
          </button>
        </div>

        {isTooLarge ? (
          <div className="modal-body-warning">
            <AlertCircle size={44} color="#4C4541" />
            <h4>{"Step-Through Visualizer is configured for n ≤ 5"}</h4>
            <p>
              Your active map has <strong>n = {n}</strong> places (2<sup>{n}</sup> = {1 << n} matrix rows). 
              For clear academic presentation and tabular video recording, load the 4-node demo scenario.
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => {
                onLoadPreset('stepthrough_demo');
                onClose();
              }}
            >
              ⚡ Load 4-Node Step-Through Demo Preset
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="modal-body-warning">
            <p>Add up to 5 destinations on the map canvas to inspect the DP table step-by-step.</p>
          </div>
        ) : (
          <div className="modal-body-content">
            
            {/* Top Playback Controls Ribbon */}
            <div className="stepper-controls-ribbon">
              <div className="controls-btns">
                <button className="btn btn-secondary btn-sm" onClick={handleStepBackward} disabled={stepIdx === 0}>
                  <SkipBack size={14} /> Prev
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleTogglePlay}>
                  {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                  {isPlaying ? 'Pause' : 'Auto-Play'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleStepForward} disabled={stepIdx >= history.length - 1}>
                  Next <SkipForward size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleReset}>
                  <RotateCcw size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleJumpToEnd}>
                  <FastForward size={14} />
                </button>
              </div>

              <div className="stepper-speed-slider">
                <label>Speed:</label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="100"
                  value={playbackSpeedMs}
                  onChange={(e) => setPlaybackSpeedMs(Number(e.target.value))}
                />
                <span>{(playbackSpeedMs / 1000).toFixed(1)}s</span>
              </div>

              <div className="stepper-counter-badge">
                Step <strong>{stepIdx + 1}</strong> / {history.length}
              </div>
            </div>

            {/* Current Step Mathematical Explanation */}
            <div className="stepper-active-card">
              <div className="stepper-card-header">
                <div className="stepper-badge-group">
                  <span className={`badge ${curStep.type === 'base_case' ? 'badge-warning' : 'badge-success'}`}>
                    {curStep.type === 'base_case' ? 'Base Case (Depot Start)' : 'Optimal Subproblem Relaxation'}
                  </span>
                  <span className="stepper-mask-tag">Mask: {curStep.maskBinary}₂</span>
                </div>
                <div className="stepper-formula-tag">
                  {"DP[S ∪ {v}][v] = min_u ( DP[S][u] + travel(u, v) + stay[v] )"}
                </div>
              </div>

              <p className="stepper-explanation">{curStep.explanation}</p>

              <div className="stepper-metrics-chips">
                <span className="step-chip"><strong>Subset:</strong> {curStep.maskBinary}₂ ({maskToSetNotation(curStep.mask)})</span>
                <span className="step-chip"><strong>End Node:</strong> #{curStep.last + 1} ({places[curStep.last]?.name})</span>
                <span className="step-chip"><strong>From:</strong> {curStep.prev === 'Depot' ? '🏁 Depot' : `Node #${curStep.prev + 1}`}</span>
                <span className="step-chip"><strong>Reward Sum:</strong> +{curStep.reward} Pts</span>
                <span className="step-chip highlight"><strong>Time Used:</strong> {curStep.accumulatedTime?.toFixed(1)}m</span>
                <span className={`step-chip ${curStep.isFeasible ? 'feasible' : 'infeasible'}`}>
                  {curStep.isFeasible ? '✅ Feasible (≤ Budget)' : '❌ Over Budget'}
                </span>
              </div>
            </div>

            {/* DP Matrix Table */}
            <div className="stepper-table-container">
              <table className="stepper-dp-table">
                <thead>
                  <tr>
                    <th>Subset Mask (Binary / Set)</th>
                    {places.map((place, idx) => (
                      <th key={idx}>
                        Last: #{idx + 1} ({place.name.split(' ')[0]})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: numStates - 1 }, (_, i) => i + 1).map((mask) => {
                    const bin = mask.toString(2).padStart(n, '0');
                    const isRowActive = curStep.mask === mask;

                    return (
                      <tr key={mask} className={isRowActive ? 'active-row' : ''}>
                        <td className="mask-col">
                          <span className="bin-code">{bin}₂</span>{' '}
                          <span className="set-code">{maskToSetNotation(mask)}</span>
                        </td>
                        {places.map((_, j) => {
                          const isMember = (mask & (1 << j)) !== 0;
                          const isCellActive = isRowActive && curStep.last === j;
                          const val = cellValues[`${mask}-${j}`];

                          if (!isMember) {
                            return <td key={j} className="empty-cell">-</td>;
                          }

                          return (
                            <td
                              key={j}
                              className={`val-cell ${isCellActive ? 'active-cell' : ''}`}
                            >
                              {val !== undefined ? `${val.toFixed(1)}m` : '∞'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
