import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Loader } from './components/Loader';
import { HeroSection } from './components/HeroSection';
import { StorySection } from './components/StorySection';
import { PlaygroundSection } from './components/PlaygroundSection';
import { BenchmarkSection } from './components/BenchmarkSection';
import { TheorySection } from './components/TheorySection';
import { ApplicationsSection } from './components/ApplicationsSection';
import { Footer } from './components/Footer';
import { DPStepThroughModal } from './components/DPStepThroughModal';
import { SelfCheckModal } from './components/SelfCheckModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PRESET_SCENARIOS } from './algorithms/presets';
import { OrienteeringSolvers } from './algorithms/solvers';
import { useLenisScroll } from './hooks/useLenisScroll';
import { useCursorEffect } from './hooks/useCursorEffect';
import { sounds } from './utils/soundEffects';
import { Sparkles } from 'lucide-react';

export function App() {
  // Smooth scroll and custom cursor hooks
  useLenisScroll();
  const { cursorRef, trailRef } = useCursorEffect();

  const [isLoading, setIsLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Playground state
  const [currentPresetId, setCurrentPresetId] = useState('scenic_trap');
  const [depot, setDepot] = useState({ x: 140, y: 260, name: 'Basecamp Hotel' });
  const [places, setPlaces] = useState([]);
  const [budget, setBudget] = useState(135);
  const [speed, setSpeed] = useState(80);
  const [returnToStart, setReturnToStart] = useState(true);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(-1);

  // Solver flags
  const [currentSolver, setCurrentSolver] = useState('dp'); // 'dp' | 'backtracking' | 'greedy'
  const [enablePruning, setEnablePruning] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [activeRoutes, setActiveRoutes] = useState(null);
  const [vehicleAnim, setVehicleAnim] = useState(null);

  // Modals & Toasts
  const [isStepThroughOpen, setIsStepThroughOpen] = useState(false);
  const [isSelfCheckOpen, setIsSelfCheckOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const solveAll = useCallback((dep, locs, spd, bud, ret, prune) => {
    if (!locs || locs.length === 0) {
      setActiveRoutes(null);
      return;
    }
    const sol = OrienteeringSolvers.solveAll(dep, locs, spd, bud, ret, prune);
    setActiveRoutes(sol);
  }, []);

  const loadPresetById = useCallback((presetId) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!preset) return;

    setCurrentPresetId(presetId);
    setDepot({ ...preset.depot });
    setPlaces(preset.places.map((p) => ({ ...p })));
    setBudget(preset.budget || 120);
    setSpeed(preset.speed || 80);
    setReturnToStart(preset.returnToStart ?? true);
    setSelectedNodeIndex(-1);
    setVehicleAnim(null);
    sounds.playClick();
    showToast(`Loaded: ${preset.name}`);

    solveAll(
      preset.depot,
      preset.places,
      preset.speed || 80,
      preset.budget || 120,
      preset.returnToStart ?? true,
      enablePruning
    );
  }, [enablePruning, solveAll]);

  // Initial Load with Preset 1
  useEffect(() => {
    loadPresetById('scenic_trap');
  }, []);

  // Re-solve on parameter change
  useEffect(() => {
    solveAll(depot, places, speed, budget, returnToStart, enablePruning);
  }, [depot, places, speed, budget, returnToStart, enablePruning, solveAll]);

  const handleStateModified = (newPlaces, newDepot) => {
    solveAll(newDepot || depot, newPlaces, speed, budget, returnToStart, enablePruning);
  };

  const handleGenerateRandom = (n = 8) => {
    sounds.playClick();
    const padding = 60;
    const w = 680;
    const h = 400;

    const newDepot = {
      x: Math.round(padding + Math.random() * (w - 2 * padding)),
      y: Math.round(padding + Math.random() * (h - 2 * padding)),
      name: 'Start Basecamp'
    };

    const categories = ['landmark', 'viewpoint', 'museum', 'park', 'cafe'];
    const newPlaces = [];

    for (let i = 0; i < n; i++) {
      const reward = Math.floor(Math.random() * 10) + 1;
      const stay = Math.floor(Math.random() * 18) + 6;
      const cat = categories[Math.floor(Math.random() * categories.length)];
      newPlaces.push({
        id: i + 1,
        name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} #${i + 1}`,
        x: Math.round(padding + Math.random() * (w - 2 * padding)),
        y: Math.round(padding + Math.random() * (h - 2 * padding)),
        reward,
        stayTime: stay,
        category: cat
      });
    }

    const calculatedBudget = Math.round(110 + n * 14);
    setDepot(newDepot);
    setPlaces(newPlaces);
    setBudget(calculatedBudget);
    setSelectedNodeIndex(-1);
    setVehicleAnim(null);
    showToast(`Generated random instance with n = ${n}, Budget = ${calculatedBudget}m`);
    solveAll(newDepot, newPlaces, speed, calculatedBudget, returnToStart, enablePruning);
  };

  const handleClear = () => {
    sounds.playClick();
    setPlaces([]);
    setSelectedNodeIndex(-1);
    setVehicleAnim(null);
    setActiveRoutes(null);
    showToast('Canvas cleared');
  };

  const jumpToPlayground = () => {
    const el = document.getElementById('playground');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const jumpToTheory = () => {
    const el = document.getElementById('theory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        const playBtn = document.querySelector('.playback-buttons-group .btn-primary');
        if (playBtn) playBtn.click();
      } else if (e.key === 'r' || e.key === 'R') {
        handleGenerateRandom(places.length || 8);
      } else if (e.key === 'c' || e.key === 'C') {
        setCompareMode((prev) => !prev);
        sounds.playClick();
      } else if (e.key === '1') {
        setCurrentSolver('dp');
        sounds.playClick();
      } else if (e.key === '2') {
        setCurrentSolver('backtracking');
        sounds.playClick();
      } else if (e.key === '3') {
        setCurrentSolver('greedy');
        sounds.playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [places.length]);

  return (
    <div className="budgettrail-app-root">
      
      {/* Custom Interactive Cursor */}
      <div className="custom-cursor-dot" ref={cursorRef} />
      <div className="custom-cursor-trail" ref={trailRef} />

      {/* Smooth Entrance Loader */}
      {isLoading && <Loader onFinished={() => setIsLoading(false)} />}

      {/* Floating Pill Navbar */}
      <Navbar
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        onOpenSelfCheck={() => setIsSelfCheckOpen(true)}
      />

      {/* Main Single-Page Sections */}
      <main className="main-scroll-container">
        <ErrorBoundary>
          
          {/* 1. Hero Section */}
          <HeroSection onLaunchPlayground={jumpToPlayground} />

          {/* 2. Problem Story Section */}
          <StorySection onJumpToPlayground={jumpToPlayground} />

          {/* 3. Main Playground Section (Bento Grid) */}
          <PlaygroundSection
            depot={depot}
            setDepot={setDepot}
            places={places}
            setPlaces={setPlaces}
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
            selectedNodeIndex={selectedNodeIndex}
            setSelectedNodeIndex={setSelectedNodeIndex}
            activeRoutes={activeRoutes}
            vehicleAnim={vehicleAnim}
            setVehicleAnim={setVehicleAnim}
            currentPresetId={currentPresetId}
            onLoadPreset={loadPresetById}
            onGenerateRandom={handleGenerateRandom}
            onClear={handleClear}
            onOpenStepThrough={() => setIsStepThroughOpen(true)}
            onOpenSelfCheck={() => setIsSelfCheckOpen(true)}
            onStateModified={handleStateModified}
            onJumpToTheory={jumpToTheory}
          />

          {/* 4. Neo-Brutalist Benchmark Section */}
          <BenchmarkSection speed={speed} />

          {/* 5. Minimalist Swiss Theory & Proofs Section */}
          <TheorySection />

          {/* 6. Real-World Applications Infinite Carousel */}
          <ApplicationsSection />

          {/* 7. Footer */}
          <Footer />

        </ErrorBoundary>
      </main>

      {/* DP Bitmask Step-Through Debugger Modal */}
      <DPStepThroughModal
        isOpen={isStepThroughOpen}
        onClose={() => setIsStepThroughOpen(false)}
        depot={depot}
        places={places}
        speed={speed}
        budget={budget}
        returnToStart={returnToStart}
        onLoadPreset={loadPresetById}
      />

      {/* Self-Check 50-Test Verification Suite Modal */}
      <SelfCheckModal
        isOpen={isSelfCheckOpen}
        onClose={() => setIsSelfCheckOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="spatial-toast-pill">
          <Sparkles size={15} color="#4C4541" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
