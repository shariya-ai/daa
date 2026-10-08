import React from 'react';
import { Play, Pause, RotateCcw, Clock, Target, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export function RoutePlaybackHUD({
  activeSol,
  vehicleAnim,
  setVehicleAnim,
  places,
  depot,
  speed,
  budget,
  returnToStart
}) {
  const handleStartAnimation = () => {
    if (!activeSol || !activeSol.order || activeSol.order.length === 0) return;

    sounds.playClick();
    const segments = [];
    let prev = depot;
    let accumulatedTime = 0;

    for (let i = 0; i < activeSol.order.length; i++) {
      const idx = activeSol.order[i];
      const place = places[idx];
      const dist = Math.hypot(place.x - prev.x, place.y - prev.y);
      const travelTime = speed > 0 ? dist / speed : 0;
      const totalSegDuration = travelTime + place.stayTime;

      segments.push({
        from: prev,
        to: place,
        placeIndex: idx,
        place,
        dist,
        travelTime,
        stayTime: place.stayTime,
        duration: Math.max(0.4, travelTime + (place.stayTime * 0.05)),
        stepNumber: i + 1,
        reward: place.reward,
        prevAccTime: accumulatedTime
      });

      accumulatedTime += travelTime + place.stayTime;
      prev = place;
    }

    // Optional return leg
    if (returnToStart && activeSol.order.length > 0) {
      const dist = Math.hypot(depot.x - prev.x, depot.y - prev.y);
      const travelTime = speed > 0 ? dist / speed : 0;
      segments.push({
        from: prev,
        to: depot,
        placeIndex: -1,
        place: depot,
        dist,
        travelTime,
        stayTime: 0,
        duration: Math.max(0.3, travelTime),
        stepNumber: activeSol.order.length + 1,
        reward: 0,
        prevAccTime: accumulatedTime,
        isReturnLeg: true
      });
      accumulatedTime += travelTime;
    }

    setVehicleAnim({
      segments,
      segmentIdx: 0,
      segmentProgress: 0,
      running: true,
      paused: false,
      liveTime: 0
    });

    if (activeSol.isOptimal) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4C4541', '#F2C46A', '#AEAC78', '#FCF0DA']
      });
    }
  };

  const handlePauseToggle = () => {
    if (!vehicleAnim) return;
    sounds.playClick();
    setVehicleAnim({
      ...vehicleAnim,
      paused: !vehicleAnim.paused
    });
  };

  const handleReset = () => {
    sounds.playClick();
    setVehicleAnim(null);
  };

  // Compute live ticker values
  let liveReward = 0;
  let liveTimeSpent = 0;
  let currentStepText = 'Standby';

  if (vehicleAnim) {
    const curSegIdx = vehicleAnim.segmentIdx;
    currentStepText = curSegIdx >= vehicleAnim.segments.length 
      ? 'Tour Completed' 
      : `Transit: Stop ${curSegIdx + 1} / ${vehicleAnim.segments.length}`;

    for (let i = 0; i < Math.min(curSegIdx, vehicleAnim.segments.length); i++) {
      const s = vehicleAnim.segments[i];
      liveReward += s.reward || 0;
      liveTimeSpent += (s.travelTime + s.stayTime);
    }

    if (curSegIdx < vehicleAnim.segments.length) {
      const s = vehicleAnim.segments[curSegIdx];
      const prog = vehicleAnim.segmentProgress;
      liveTimeSpent += (s.travelTime + s.stayTime) * prog;
      if (prog > 0.7) {
        liveReward += s.reward || 0;
      }
    }
  } else if (activeSol) {
    liveReward = activeSol.totalReward;
    liveTimeSpent = activeSol.timeUsed;
  }

  const remainingBudget = Math.max(0, budget - liveTimeSpent);
  const budgetUsagePct = budget > 0 ? Math.min(100, (liveTimeSpent / budget) * 100) : 0;

  return (
    <div className="playback-hud-card">
      
      {/* Top Controls & Main Metrics */}
      <div className="playback-ribbon-top">
        <div className="playback-buttons-group">
          <button className="btn btn-primary" onClick={handleStartAnimation}>
            <Play size={16} fill="currentColor" /> Play Route
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handlePauseToggle}
            disabled={!vehicleAnim}
          >
            <Pause size={14} /> {vehicleAnim?.paused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleReset}
            disabled={!vehicleAnim}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div className="playback-metrics-strip">
          <div className="telemetry-unit">
            <span className="unit-lbl"><Target size={11} /> Total Reward Collected</span>
            <span className="unit-val reward-cyan">+{liveReward} Points</span>
          </div>

          <div className="telemetry-unit">
            <span className="unit-lbl"><Clock size={11} /> Time Used / Budget</span>
            <span className="unit-val time-violet">{liveTimeSpent.toFixed(1)}m / {budget}m</span>
          </div>

          <div className="telemetry-unit">
            <span className="unit-lbl"><Activity size={11} /> Expedition Status</span>
            <span className="unit-val">{currentStepText}</span>
          </div>
        </div>
      </div>

      {/* Real-time Budget Drain Bar */}
      <div className="budget-drain-container">
        <div className="budget-drain-header">
          <span>Remaining Time Budget Gauge:</span>
          <strong>{remainingBudget.toFixed(1)} min left ({budgetUsagePct.toFixed(0)}% used)</strong>
        </div>
        <div className="budget-progress-track">
          <div
            className={`budget-progress-fill ${budgetUsagePct > 95 ? 'critical' : budgetUsagePct > 75 ? 'warning' : 'optimal'}`}
            style={{ width: `${budgetUsagePct}%` }}
          />
        </div>
      </div>

      {/* Visiting Schedule Chips Ribbon */}
      <div className="schedule-chips-wrapper">
        <div className="schedule-header">
          <span>Visiting Schedule ({activeSol?.name || 'Active Solution'}):</span>
        </div>

        <div className="schedule-chips-scroll">
          <span className="schedule-chip depot">
            <strong>🏁 Depot v₀</strong>
            <small>t = 0.0m</small>
          </span>

          {activeSol?.arrivalTimes?.map((item, idx) => {
            const p = item.place;
            return (
              <React.Fragment key={idx}>
                <span className="schedule-arrow">➔</span>
                <span className="schedule-chip destination">
                  <div className="chip-name">#{idx + 1} {p.name}</div>
                  <div className="chip-stats">
                    <span className="chip-reward">+{p.reward} R</span>
                    <span className="chip-time">Arr: {item.arrivalTime.toFixed(1)}m (Stay: {p.stayTime}m)</span>
                  </div>
                </span>
              </React.Fragment>
            );
          })}

          {returnToStart && activeSol?.order?.length > 0 && (
            <>
              <span className="schedule-arrow">➔</span>
              <span className="schedule-chip depot-return">
                <strong>🏁 Return Depot v₀</strong>
                <small>Close: {activeSol.timeUsed.toFixed(1)}m</small>
              </span>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
