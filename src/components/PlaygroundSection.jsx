import React from 'react';
import { MapCanvas } from './MapCanvas';
import { ControlsPanel } from './ControlsPanel';
import { RoutePlaybackHUD } from './RoutePlaybackHUD';
import { CompareTable } from './CompareTable';
import { Preset3DDome } from './Preset3DDome';
import { Sparkles } from 'lucide-react';

export function PlaygroundSection({
  depot,
  setDepot,
  places,
  setPlaces,
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
  selectedNodeIndex,
  setSelectedNodeIndex,
  activeRoutes,
  vehicleAnim,
  setVehicleAnim,
  currentPresetId,
  onLoadPreset,
  onGenerateRandom,
  onClear,
  onOpenStepThrough,
  onOpenSelfCheck,
  onStateModified,
  onJumpToTheory
}) {
  const activeSol = activeRoutes?.[currentSolver] || activeRoutes?.dp || activeRoutes?.greedy;

  return (
    <section id="playground" className="playground-bento-section">
      
      {/* Section Header */}
      <div className="section-header-centered" style={{ marginBottom: '1.5rem' }}>
        <div className="section-eyebrow">
          <Sparkles size={14} /> Interactive Spatial Optimizer
        </div>
        <h2 className="section-title">
          The Orienteering Expedition Playground
        </h2>
        <p className="section-subtitle">
          Construct custom attraction networks, adjust time budgets, toggle return-to-depot requirements, and watch the solvers compute global optimal reward routes live.
        </p>
      </div>

      {/* 1. 3D Preset Dome Gallery */}
      <Preset3DDome
        currentPresetId={currentPresetId}
        onLoadPreset={onLoadPreset}
      />

      {/* 2. Main Bento Grid: Map + Sidebar + Telemetry + Comparison */}
      <div className="playground-bento-grid">
        
        {/* Left Column: Interactive Map + Playback HUD + Overlaid Table */}
        <div className="playground-main-stage">
          
          {/* Map Canvas */}
          <MapCanvas
            depot={depot}
            setDepot={setDepot}
            places={places}
            setPlaces={setPlaces}
            selectedNodeIndex={selectedNodeIndex}
            setSelectedNodeIndex={setSelectedNodeIndex}
            activeRoutes={activeRoutes}
            currentSolver={currentSolver}
            compareMode={compareMode}
            vehicleAnim={vehicleAnim}
            setVehicleAnim={setVehicleAnim}
            speed={speed}
            budget={budget}
            returnToStart={returnToStart}
            onStateModified={onStateModified}
          />

          {/* Route Playback HUD & Budget Drain Gauge */}
          <RoutePlaybackHUD
            activeSol={activeSol}
            vehicleAnim={vehicleAnim}
            setVehicleAnim={setVehicleAnim}
            places={places}
            depot={depot}
            speed={speed}
            budget={budget}
            returnToStart={returnToStart}
          />

          {/* Overlaid Comparative Results Table */}
          <CompareTable
            allSol={activeRoutes}
            currentSolver={currentSolver}
            budget={budget}
            onJumpToTheory={onJumpToTheory}
          />

        </div>

        {/* Right Column: Controls Bento Panel */}
        <div className="playground-controls-sidebar">
          <ControlsPanel
            budget={budget}
            setBudget={setBudget}
            speed={speed}
            setSpeed={setSpeed}
            returnToStart={returnToStart}
            setReturnToStart={setReturnToStart}
            currentSolver={currentSolver}
            setCurrentSolver={setCurrentSolver}
            enablePruning={enablePruning}
            setEnablePruning={setEnablePruning}
            compareMode={compareMode}
            setCompareMode={setCompareMode}
            places={places}
            setPlaces={setPlaces}
            depot={depot}
            setDepot={setDepot}
            selectedNodeIndex={selectedNodeIndex}
            setSelectedNodeIndex={setSelectedNodeIndex}
            onGenerateRandom={onGenerateRandom}
            onClear={onClear}
            onOpenStepThrough={onOpenStepThrough}
            onOpenSelfCheck={onOpenSelfCheck}
            onStateModified={onStateModified}
          />
        </div>

      </div>

    </section>
  );
}
