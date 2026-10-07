import React, { useState } from 'react';
import { 
  Sliders, 
  Clock, 
  Gauge, 
  RotateCcw, 
  Dices, 
  Trash2, 
  Layers, 
  Eye, 
  CheckCircle, 
  Plus, 
  ChevronRight,
  Sparkles,
  Cpu
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function ControlsPanel({
  budget,
  setBudget,
  speed,
  setSpeed,
  returnToStart,
  setReturnToStart,
  currentSolver,
  setCurrentSolver,
  enablePruning,
  setEnablePruning,
  compareMode,
  setCompareMode,
  places,
  setPlaces,
  depot,
  setDepot,
  selectedNodeIndex,
  setSelectedNodeIndex,
  onGenerateRandom,
  onClear,
  onOpenStepThrough,
  onOpenSelfCheck,
  onStateModified
}) {
  const [randomN, setRandomN] = useState(8);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceReward, setNewPlaceReward] = useState(8);
  const [newPlaceStay, setNewPlaceStay] = useState(12);
  const [newPlaceCat, setNewPlaceCat] = useState('viewpoint');

  const handleSolverSelect = (solver) => {
    sounds.playClick();
    setCurrentSolver(solver);
  };

  const handleAddPlace = (e) => {
    e.preventDefault();
    if (places.length >= 20) return;
    sounds.playRewardTick(Number(newPlaceReward));

    const id = places.length + 1;
    const name = newPlaceName.trim() || `Place #${id}`;
    const x = Math.round(80 + Math.random() * 520);
    const y = Math.round(80 + Math.random() * 320);

    const newPlace = {
      id,
      name,
      x,
      y,
      reward: Number(newPlaceReward),
      stayTime: Number(newPlaceStay),
      category: newPlaceCat
    };

    const updated = [...places, newPlace];
    setPlaces(updated);
    setSelectedNodeIndex(updated.length - 1);
    setNewPlaceName('');
    setShowAddForm(false);
    if (onStateModified) onStateModified(updated, depot);
  };

  const handleRewardSliderChange = (idx, val) => {
    const updated = [...places];
    updated[idx] = { ...updated[idx], reward: Number(val) };
    setPlaces(updated);
    sounds.playRewardTick(Number(val));
    if (onStateModified) onStateModified(updated, depot);
  };

  const handleStaySliderChange = (idx, val) => {
    const updated = [...places];
    updated[idx] = { ...updated[idx], stayTime: Number(val) };
    setPlaces(updated);
    if (onStateModified) onStateModified(updated, depot);
  };

  const handleDeletePlace = (idx) => {
    sounds.playClick();
    const updated = places.filter((_, i) => i !== idx).map((p, i) => ({ ...p, id: i + 1 }));
    setPlaces(updated);
    setSelectedNodeIndex(-1);
    if (onStateModified) onStateModified(updated, depot);
  };

  return (
    <div className="controls-bento-sidebar">
      
      {/* 1. Algorithm Selection Bento Box */}
      <div className="bento-card">
        <div className="bento-card-header">
          <div className="header-title">
            <Sliders size={16} color="#00f2fe" />
            <span>Algorithm Engine</span>
          </div>
          <span className="header-tag">Solver</span>
        </div>

        {/* 3 Solver Mode Pills */}
        <div className="solver-pills-container">
          <button
            className={`solver-pill ${currentSolver === 'dp' ? 'active dp' : ''}`}
            onClick={() => handleSolverSelect('dp')}
          >
            Bitmask DP
          </button>
          <button
            className={`solver-pill ${currentSolver === 'backtracking' ? 'active bb' : ''}`}
            onClick={() => handleSolverSelect('backtracking')}
          >
            Branch & Bound
          </button>
          <button
            className={`solver-pill ${currentSolver === 'greedy' ? 'active greedy' : ''}`}
            onClick={() => handleSolverSelect('greedy')}
          >
            Greedy Ratio
          </button>
        </div>

        {/* Quick Toggles */}
        <div className="toggles-list">
          <label className="custom-toggle-row">
            <div className="toggle-label">
              <Layers size={14} color="#8b5cf6" />
              <span>B&B Pruning Active</span>
            </div>
            <input
              type="checkbox"
              className="toggle-switch"
              checked={enablePruning}
              onChange={(e) => {
                sounds.playClick();
                setEnablePruning(e.target.checked);
              }}
            />
          </label>

          <label className="custom-toggle-row">
            <div className="toggle-label">
              <RotateCcw size={14} color="#00f2fe" />
              <span>Return to Depot ($v_0$)</span>
            </div>
            <input
              type="checkbox"
              className="toggle-switch"
              checked={returnToStart}
              onChange={(e) => {
                sounds.playClick();
                setReturnToStart(e.target.checked);
              }}
            />
          </label>

          <label className="custom-toggle-row">
            <div className="toggle-label">
              <Eye size={14} color="#f59e0b" />
              <span>Overlay Compare Mode</span>
            </div>
            <input
              type="checkbox"
              className="toggle-switch"
              checked={compareMode}
              onChange={(e) => {
                sounds.playClick();
                setCompareMode(e.target.checked);
              }}
            />
          </label>
        </div>

        {/* Special Modal Launchers */}
        <div className="special-buttons-row">
          <button
            className="btn btn-outline btn-sm"
            style={{ flex: 1, borderColor: 'rgba(0, 242, 254, 0.4)', color: '#00f2fe' }}
            onClick={() => {
              sounds.playClick();
              onOpenStepThrough();
            }}
          >
            <Cpu size={14} /> DP Bitmask Stepper
          </button>

          <button
            className="btn btn-outline btn-sm"
            style={{ flex: 1, borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}
            onClick={() => {
              sounds.playClick();
              onOpenSelfCheck();
            }}
          >
            <CheckCircle size={14} /> Self-Check
          </button>
        </div>
      </div>

      {/* 2. Budget & Velocity Parameters */}
      <div className="bento-card">
        <div className="bento-card-header">
          <div className="header-title">
            <Clock size={16} color="#00f2fe" />
            <span>Time Budget & Speed</span>
          </div>
          <span className="header-tag highlight">{budget} min</span>
        </div>

        {/* Budget Slider */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Total Time Budget ($B$):</span>
            <strong className="slider-val-tag cyan">{budget} min</strong>
          </div>
          <input
            type="range"
            min="30"
            max="400"
            step="5"
            className="spatial-range cyan"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </div>

        {/* Speed Slider */}
        <div className="slider-group" style={{ marginTop: '0.6rem' }}>
          <div className="slider-label-row">
            <span><Gauge size={13} style={{ display: 'inline' }} /> Vehicle Speed:</span>
            <strong className="slider-val-tag violet">{speed} px/min</strong>
          </div>
          <input
            type="range"
            min="30"
            max="200"
            step="5"
            className="spatial-range violet"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        {/* Random Generator Strip */}
        <div className="random-gen-strip">
          <div className="n-input-box">
            <span>$n =$</span>
            <input
              type="number"
              min="3"
              max="18"
              value={randomN}
              onChange={(e) => setRandomN(Number(e.target.value))}
              className="n-input"
            />
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onGenerateRandom(randomN)}
          >
            <Dices size={14} /> Randomize
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={onClear}
            title="Clear all destinations"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 3. Destinations List & Weight Editor */}
      <div className="bento-card" style={{ flex: 1, minHeight: '300px' }}>
        <div className="bento-card-header">
          <div className="header-title">
            <span>Destinations ({places.length})</span>
          </div>
          <button
            className="btn btn-sm btn-outline"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={13} /> {showAddForm ? 'Cancel' : 'Add Spot'}
          </button>
        </div>

        {/* Add Spot Form */}
        {showAddForm && (
          <form onSubmit={handleAddPlace} className="add-place-form">
            <input
              type="text"
              className="form-input-spatial"
              placeholder="Name (e.g. Alpine Summit)"
              value={newPlaceName}
              onChange={(e) => setNewPlaceName(e.target.value)}
            />
            <div className="form-row-compact">
              <select
                className="form-select-spatial"
                value={newPlaceCat}
                onChange={(e) => setNewPlaceCat(e.target.value)}
              >
                <option value="landmark">Landmark</option>
                <option value="viewpoint">Viewpoint</option>
                <option value="museum">Museum</option>
                <option value="park">Park</option>
                <option value="cafe">Cafe</option>
              </select>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input-spatial num"
                placeholder="R"
                value={newPlaceReward}
                onChange={(e) => setNewPlaceReward(e.target.value)}
                title="Reward (1-10)"
              />
              <input
                type="number"
                min="0"
                max="60"
                className="form-input-spatial num"
                placeholder="Stay"
                value={newPlaceStay}
                onChange={(e) => setNewPlaceStay(e.target.value)}
                title="Stay time (min)"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Add Destination to Map
            </button>
          </form>
        )}

        {/* Places Scroll List */}
        <div className="places-compact-list">
          {places.map((place, idx) => {
            const isSelected = selectedNodeIndex === idx;
            return (
              <div
                key={place.id || idx}
                className={`place-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedNodeIndex(idx)}
              >
                <div className="place-item-top">
                  <div className="place-title-group">
                    <span className="place-index-chip">#{idx + 1}</span>
                    <strong className="place-name-text">{place.name}</strong>
                  </div>
                  <button
                    className="delete-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlace(idx);
                    }}
                    title="Remove place"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="place-sliders-grid">
                  <div className="mini-slider-unit">
                    <div className="mini-slider-label">
                      <span>Reward:</span>
                      <strong style={{ color: '#00f2fe' }}>+{place.reward}</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={place.reward}
                      onChange={(e) => handleRewardSliderChange(idx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="spatial-range-mini cyan"
                    />
                  </div>

                  <div className="mini-slider-unit">
                    <div className="mini-slider-label">
                      <span>Stay Time:</span>
                      <strong style={{ color: '#8b5cf6' }}>{place.stayTime}m</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      value={place.stayTime}
                      onChange={(e) => handleStaySliderChange(idx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="spatial-range-mini violet"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
