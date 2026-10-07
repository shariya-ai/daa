import React, { useState } from 'react';
import { PRESET_SCENARIOS } from '../algorithms/presets';
import { Sparkles, ChevronLeft, ChevronRight, Compass, Clock, MapPin } from 'lucide-react';
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

  return (
    <div className="dome-gallery-wrapper">
      <div className="dome-gallery-topbar">
        <div className="dome-title">
          <Sparkles size={16} color="#00f2fe" />
          <span>3D Preset Dome Gallery — 5 Rigorous Test Cases</span>
        </div>
        <div className="dome-nav-arrows">
          <button className="dome-arrow-btn" onClick={handlePrev} title="Previous Preset">
            <ChevronLeft size={16} />
          </button>
          <span className="dome-counter">{activeIdx + 1} / {PRESET_SCENARIOS.length}</span>
          <button className="dome-arrow-btn" onClick={handleNext} title="Next Preset">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3D Rotating Dome Deck */}
      <div className="dome-stage-3d">
        <div className="dome-cards-carousel">
          {PRESET_SCENARIOS.map((preset, idx) => {
            const offset = idx - activeIdx;
            const isActive = idx === activeIdx;

            // Compute 3D transform for circular dome arrangement
            const rotateY = offset * 24;
            const translateZ = isActive ? 0 : -Math.abs(offset) * 60;
            const translateX = offset * 220;
            const opacity = Math.max(0.25, 1 - Math.abs(offset) * 0.35);

            return (
              <div
                key={preset.id}
                className={`dome-card ${isActive ? 'active' : ''}`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex: 10 - Math.abs(offset)
                }}
                onClick={() => handleSelectPreset(idx)}
              >
                <div className="dome-card-header">
                  <span className="dome-card-tag" style={{ color: preset.color, borderColor: `${preset.color}50`, background: `${preset.color}15` }}>
                    {preset.tag}
                  </span>
                  <div className="dome-card-places-count">
                    <MapPin size={12} /> {preset.places.length} Spots
                  </div>
                </div>

                <h4 className="dome-card-name">{preset.name}</h4>
                <p className="dome-card-desc">{preset.description}</p>

                <div className="dome-card-specs">
                  <div className="spec-item">
                    <Clock size={12} color="#00f2fe" />
                    <span>Budget: <strong>{preset.budget}m</strong></span>
                  </div>
                  <div className="spec-item">
                    <Compass size={12} color="#8b5cf6" />
                    <span>Return: <strong>{preset.returnToStart ? 'Yes' : 'No'}</strong></span>
                  </div>
                </div>

                <button
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPreset(idx);
                  }}
                >
                  {isActive ? '✓ Loaded on Map' : 'Load Scenario'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
