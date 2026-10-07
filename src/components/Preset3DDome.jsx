import React, { useState } from 'react';
import { PRESET_SCENARIOS } from '../algorithms/presets';
import { Sparkles, ChevronLeft, ChevronRight, Compass, Clock, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export function Preset3DDome({ currentPresetId, onLoadPreset }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleSelectPreset = (idx) => {
    sounds.playClick();
    setActiveIdx(idx);
    const preset = PRESET_SCENARIOS[idx];
    if (preset) {
      onLoadPreset(preset.id);
    }
  };

  const handlePrev = () => {
    const nextIdx = (activeIdx - 1 + PRESET_SCENARIOS.length) % PRESET_SCENARIOS.length;
    handleSelectPreset(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIdx + 1) % PRESET_SCENARIOS.length;
    handleSelectPreset(nextIdx);
  };

  const curPreset = PRESET_SCENARIOS[activeIdx] || PRESET_SCENARIOS[0];

  return (
    <div className="dome-gallery-wrapper">
      <div className="dome-gallery-topbar">
        <div className="dome-title">
          <Sparkles size={16} color="#00f2fe" />
          <span>Preset Scenario Gallery — 5 Academic Test Benches</span>
        </div>
        <div className="dome-nav-arrows">
          <button className="dome-arrow-btn" onClick={handlePrev} title="Previous Scenario" aria-label="Previous Scenario">
            <ChevronLeft size={16} />
          </button>
          <span className="dome-counter">{activeIdx + 1} / {PRESET_SCENARIOS.length}</span>
          <button className="dome-arrow-btn" onClick={handleNext} title="Next Scenario" aria-label="Next Scenario">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Preset Quick Tabs */}
      <div className="preset-tabs-bar">
        {PRESET_SCENARIOS.map((p, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={p.id}
              className={`preset-pill-tab ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectPreset(idx)}
            >
              <span className="pill-dot" style={{ background: p.color }} />
              <span className="pill-title">{p.name.split('(')[0]}</span>
              {isActive && <CheckCircle2 size={12} color="#00f2fe" />}
            </button>
          );
        })}
      </div>

      {/* Active Spotlight Scenario Card */}
      <div className="preset-spotlight-stage">
        <div className="preset-spotlight-card">
          <div className="spotlight-header">
            <div className="spotlight-title-group">
              <span
                className="dome-card-tag"
                style={{
                  color: curPreset.color,
                  borderColor: `${curPreset.color}60`,
                  background: `${curPreset.color}18`
                }}
              >
                {curPreset.tag}
              </span>
              <h3 className="spotlight-name">{curPreset.name}</h3>
            </div>
            
            <div className="spotlight-meta-pills">
              <div className="meta-pill">
                <MapPin size={13} color="#00f2fe" />
                <span><strong>{curPreset.places.length}</strong> Destinations</span>
              </div>
              <div className="meta-pill">
                <Clock size={13} color="#f59e0b" />
                <span>Budget: <strong>{curPreset.budget} min</strong></span>
              </div>
              <div className="meta-pill">
                <Compass size={13} color="#a855f7" />
                <span>Return to Depot: <strong>{curPreset.returnToStart ? 'Yes (Loop)' : 'No (Open)'}</strong></span>
              </div>
            </div>
          </div>

          <p className="spotlight-desc">{curPreset.description}</p>

          <div className="spotlight-footer">
            <div className="spotlight-places-preview">
              <span className="places-preview-lbl">Locations Included:</span>
              <div className="places-tags-wrap">
                {curPreset.places.map((place, pIdx) => (
                  <span key={pIdx} className="place-preview-chip">
                    {place.name} <small>+{place.reward}R</small>
                  </span>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary spotlight-load-btn"
              onClick={() => handleSelectPreset(activeIdx)}
            >
              <CheckCircle2 size={16} /> Load Scenario on Map Canvas <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

