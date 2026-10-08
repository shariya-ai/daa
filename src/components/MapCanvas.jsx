import React, { useRef, useEffect, useState } from 'react';
import { sounds } from '../utils/soundEffects';

export function MapCanvas({
  depot,
  setDepot,
  places,
  setPlaces,
  selectedNodeIndex,
  setSelectedNodeIndex,
  activeRoutes,
  currentSolver,
  compareMode,
  vehicleAnim,
  setVehicleAnim,
  speed,
  budget,
  returnToStart,
  onStateModified
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null); // 'depot' | index
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const animPhaseRef = useRef(0);

  const getRewardColor = (reward) => {
    if (reward >= 9) return { bg: '#F2C46A', glow: 'rgba(242, 196, 106, 0.75)', border: '#4C4541', text: '#4C4541' };
    if (reward >= 7) return { bg: '#AEAC78', glow: 'rgba(174, 172, 120, 0.65)', border: '#4C4541', text: '#FCF0DA' };
    if (reward >= 4) return { bg: '#FCF0DA', glow: 'rgba(174, 172, 120, 0.4)', border: '#AEAC78', text: '#4C4541' };
    return { bg: '#FCF0DA', glow: 'rgba(76, 69, 65, 0.2)', border: '#4C4541', text: '#4C4541' };
  };

  const getRewardRadius = (reward) => 13 + ((reward - 1) / 9) * 9;

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const findNodeAt = (x, y, hitRadius = 24) => {
    const dDepot = Math.hypot(depot.x - x, depot.y - y);
    if (dDepot <= hitRadius) return { type: 'depot', index: -1 };

    for (let i = places.length - 1; i >= 0; i--) {
      const p = places[i];
      const d = Math.hypot(p.x - x, p.y - y);
      const r = getRewardRadius(p.reward) + 6;
      if (d <= r) return { type: 'place', index: i };
    }
    return null;
  };

  const handleMouseDown = (e) => {
    if (e.button && e.button !== 0) return;
    const { x, y } = getCoords(e);
    const hit = findNodeAt(x, y);

    if (hit) {
      setIsDragging(true);
      setDragTarget(hit);
      if (hit.type === 'place') {
        setSelectedNodeIndex(hit.index);
        sounds.playRewardTick(places[hit.index].reward);
      } else {
        setSelectedNodeIndex(-1);
        sounds.playClick();
      }
    } else {
      if (places.length >= 20) return;
      const id = places.length + 1;
      const categories = ['landmark', 'viewpoint', 'museum', 'park', 'cafe'];
      const cat = categories[(id - 1) % categories.length];
      const newPlace = {
        id,
        name: `Attraction #${id}`,
        x: Math.round(x),
        y: Math.round(y),
        reward: 7,
        stayTime: 12,
        category: cat
      };
      const updated = [...places, newPlace];
      setPlaces(updated);
      setSelectedNodeIndex(updated.length - 1);
      sounds.playRewardTick(7);
      if (onStateModified) onStateModified(updated, depot);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoords(e);

    if (isDragging && dragTarget) {
      const rect = canvas.getBoundingClientRect();
      const clampedX = Math.max(25, Math.min(rect.width - 25, x));
      const clampedY = Math.max(25, Math.min(rect.height - 25, y));

      if (dragTarget.type === 'depot') {
        const updatedDepot = { ...depot, x: clampedX, y: clampedY };
        setDepot(updatedDepot);
        if (onStateModified) onStateModified(places, updatedDepot);
      } else if (dragTarget.type === 'place') {
        const updated = [...places];
        if (updated[dragTarget.index]) {
          updated[dragTarget.index] = {
            ...updated[dragTarget.index],
            x: clampedX,
            y: clampedY
          };
          setPlaces(updated);
          if (onStateModified) onStateModified(updated, depot);
        }
      }
    } else {
      const hit = findNodeAt(x, y);
      canvas.style.cursor = hit ? 'grab' : 'crosshair';

      if (hit && hit.type === 'place') {
        setHoveredPlace(places[hit.index]);
        setTooltipPos({ x, y });
      } else {
        setHoveredPlace(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragTarget(null);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const { x, y } = getCoords(e);
    const hit = findNodeAt(x, y);

    if (hit && hit.type === 'place') {
      sounds.playClick();
      const updated = places.filter((_, idx) => idx !== hit.index).map((p, idx) => ({ ...p, id: idx + 1 }));
      setPlaces(updated);
      setSelectedNodeIndex(-1);
      setHoveredPlace(null);
      if (onStateModified) onStateModified(updated, depot);
    }
  };

  const handleDoubleClick = (e) => {
    const { x, y } = getCoords(e);
    const hit = findNodeAt(x, y);
    if (hit && hit.type === 'place') {
      const updated = [...places];
      const curR = updated[hit.index].reward;
      const nextR = curR >= 10 ? 1 : curR + 1;
      updated[hit.index] = { ...updated[hit.index], reward: nextR };
      setPlaces(updated);
      sounds.playRewardTick(nextR);
      if (onStateModified) onStateModified(updated, depot);
    }
  };

  // Canvas Render Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      animPhaseRef.current = (animPhaseRef.current + 0.035) % (Math.PI * 2);

      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.resetTransform?.() || ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      // 1. Light Liquid Pearl Background
      ctx.fillStyle = '#FCF0DA';
      ctx.fillRect(0, 0, w, h);

      // Topographic subtle grid lines
      ctx.save();
      ctx.strokeStyle = 'rgba(76, 69, 65, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      ctx.beginPath();
      for (let x = 0; x < w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Atmospheric radial gradient from depot
      const bgGrad = ctx.createRadialGradient(depot.x, depot.y, 25, depot.x, depot.y, Math.max(w, h));
      bgGrad.addColorStop(0, 'rgba(242, 196, 106, 0.22)');
      bgGrad.addColorStop(0.45, 'rgba(174, 172, 120, 0.12)');
      bgGrad.addColorStop(1, 'rgba(252, 240, 218, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Active Solution Determination
      const activeSol = activeRoutes?.[currentSolver] || activeRoutes?.dp || activeRoutes?.greedy;
      const visitedSet = new Set(activeSol?.order || []);

      // 2. Spatial Mesh Links between close destinations
      if (places.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(76, 69, 65, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        for (let i = 0; i < places.length; i++) {
          for (let j = i + 1; j < places.length; j++) {
            const d = Math.hypot(places[i].x - places[j].x, places[i].y - places[j].y);
            if (d < 220) {
              ctx.moveTo(places[i].x, places[i].y);
              ctx.lineTo(places[j].x, places[j].y);
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Route Lines
      const routeStyles = {
        dp: { color: '#F2C46A', glow: 'rgba(242, 196, 106, 0.8)', strokeEdge: '#4C4541', width: 4, dash: [], offset: 0 },
        backtracking: { color: '#AEAC78', glow: 'rgba(174, 172, 120, 0.75)', strokeEdge: '#4C4541', width: 3.2, dash: [6, 4], offset: -3 },
        greedy: { color: '#4C4541', glow: 'rgba(76, 69, 65, 0.35)', strokeEdge: '#4C4541', width: 2.6, dash: [3, 4], offset: 3 }
      };

      const routesToRender = [];
      if (compareMode) {
        if (activeRoutes?.dp) routesToRender.push({ key: 'dp', sol: activeRoutes.dp });
        if (activeRoutes?.backtracking) routesToRender.push({ key: 'backtracking', sol: activeRoutes.backtracking });
        if (activeRoutes?.greedy) routesToRender.push({ key: 'greedy', sol: activeRoutes.greedy });
      } else {
        if (activeRoutes?.[currentSolver]) {
          routesToRender.push({ key: currentSolver, sol: activeRoutes[currentSolver] });
        } else if (activeRoutes?.dp) {
          routesToRender.push({ key: 'dp', sol: activeRoutes.dp });
        }
      }

      routesToRender.forEach(({ key, sol }) => {
        if (!sol?.order || sol.order.length === 0) return;
        const cfg = routeStyles[key];

        ctx.save();
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = cfg.width;
        ctx.setLineDash(cfg.dash);
        ctx.shadowColor = cfg.glow;
        ctx.shadowBlur = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        const startX = depot.x + cfg.offset;
        const startY = depot.y + cfg.offset;
        ctx.moveTo(startX, startY);

        const pts = [{ x: startX, y: startY }];
        for (let i = 0; i < sol.order.length; i++) {
          const p = places[sol.order[i]];
          if (p) {
            const pt = { x: p.x + cfg.offset, y: p.y + cfg.offset };
            pts.push(pt);
            ctx.lineTo(pt.x, pt.y);
          }
        }

        // Return to depot leg
        if (returnToStart) {
          ctx.lineTo(startX, startY);
          pts.push({ x: startX, y: startY });
        }

        ctx.stroke();

        // Directional Arrows
        for (let i = 0; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          const angle = Math.atan2(pts[i + 1].y - pts[i].y, pts[i + 1].x - pts[i].x);

          ctx.save();
          ctx.translate(midX, midY);
          ctx.rotate(angle);
          ctx.fillStyle = cfg.color;
          ctx.beginPath();
          ctx.moveTo(7, 0);
          ctx.lineTo(-7, -4);
          ctx.lineTo(-3, 0);
          ctx.lineTo(-7, 4);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#4C4541';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      });

      // 4. Draw Place Nodes & Rewards
      places.forEach((place, idx) => {
        const isSelected = selectedNodeIndex === idx;
        const isVisited = visitedSet.has(idx);
        const r = getRewardRadius(place.reward);
        const col = getRewardColor(place.reward);

        ctx.save();
        // If not in chosen route, fade to ghost mode
        if (activeSol?.order?.length > 0 && !isVisited) {
          ctx.globalAlpha = 0.35;
        }

        // Pulsing halo for high-reward summits (R >= 9)
        if (place.reward >= 9) {
          const pulse = (Math.sin(animPhaseRef.current * 3) + 1) / 2;
          ctx.beginPath();
          ctx.arc(place.x, place.y, r + 5 + pulse * 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(242, 196, 106, ${0.25 + pulse * 0.25})`;
          ctx.fill();
        }

        // Selection ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(place.x, place.y, r + 6, 0, Math.PI * 2);
          ctx.strokeStyle = '#4C4541';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
        }

        // Pin Body
        ctx.beginPath();
        ctx.arc(place.x, place.y, r, 0, Math.PI * 2);
        ctx.fillStyle = col.bg;
        ctx.shadowColor = col.glow;
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.strokeStyle = col.border;
        ctx.lineWidth = isSelected ? 2.5 : 1.8;
        ctx.stroke();

        // Pin Text: Reward
        ctx.shadowBlur = 0;
        ctx.fillStyle = col.text;
        ctx.font = 'bold 11px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${place.reward}`, place.x, place.y);

        // Place Name & Stay Time below
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillStyle = isVisited ? '#4C4541' : 'rgba(76, 69, 65, 0.65)';
        ctx.fillText(place.name, place.x, place.y + r + 13);

        ctx.font = '500 9.5px JetBrains Mono, sans-serif';
        ctx.fillStyle = 'rgba(76, 69, 65, 0.7)';
        ctx.fillText(`⏱️ ${place.stayTime}m`, place.x, place.y + r + 24);

        // Visit Sequence Badge
        if (activeSol?.order) {
          const stepIndex = activeSol.order.indexOf(idx);
          if (stepIndex !== -1) {
            ctx.beginPath();
            ctx.arc(place.x - r * 0.7, place.y - r * 0.7, 9, 0, Math.PI * 2);
            ctx.fillStyle = '#FCF0DA';
            ctx.fill();
            ctx.strokeStyle = '#4C4541';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            ctx.fillStyle = '#4C4541';
            ctx.font = 'bold 9.5px JetBrains Mono, sans-serif';
            ctx.fillText(`${stepIndex + 1}`, place.x - r * 0.7, place.y - r * 0.7);
          }
        }
        ctx.restore();
      });

      // 5. Depot Basecamp Marker
      ctx.save();
      const radarR = 24 + Math.sin(animPhaseRef.current) * 5;
      ctx.beginPath();
      ctx.arc(depot.x, depot.y, radarR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(242, 196, 106, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Diamond Flag Marker
      const dSize = 16;
      ctx.beginPath();
      ctx.moveTo(depot.x, depot.y - dSize);
      ctx.lineTo(depot.x + dSize, depot.y);
      ctx.lineTo(depot.x, depot.y + dSize);
      ctx.lineTo(depot.x - dSize, depot.y);
      ctx.closePath();
      ctx.fillStyle = '#F2C46A';
      ctx.shadowColor = 'rgba(242, 196, 106, 0.8)';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.strokeStyle = '#4C4541';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#4C4541';
      ctx.font = 'bold 10px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('v₀', depot.x, depot.y);

      ctx.font = '700 11.5px Inter, sans-serif';
      ctx.fillStyle = '#4C4541';
      ctx.fillText(depot.name || 'Start Depot v₀', depot.x, depot.y + dSize + 15);
      ctx.restore();

      // 6. Live Vehicle Expedition Animation
      if (vehicleAnim && vehicleAnim.running && !vehicleAnim.paused) {
        const seg = vehicleAnim.segments[vehicleAnim.segmentIdx];
        if (seg) {
          const delta = 0.016;
          vehicleAnim.segmentProgress += delta / seg.duration;
          vehicleAnim.liveTime += delta;

          if (vehicleAnim.segmentProgress >= 1) {
            vehicleAnim.segmentProgress = 0;
            vehicleAnim.segmentIdx++;

            if (seg.place?.reward) {
              sounds.playRewardTick(seg.place.reward);
            }

            if (vehicleAnim.segmentIdx >= vehicleAnim.segments.length) {
              vehicleAnim.running = false;
              sounds.playOptimalChime();
            }
          }

          const t = Math.max(0, Math.min(1, vehicleAnim.segmentProgress));
          const vx = seg.from.x + (seg.to.x - seg.from.x) * t;
          const vy = seg.from.y + (seg.to.y - seg.from.y) * t;
          const angle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x);

          ctx.save();
          ctx.translate(vx, vy);
          ctx.rotate(angle);

          // Forward Trail Scanner Beam
          const grad = ctx.createRadialGradient(8, 0, 2, 45, 0, 32);
          grad.addColorStop(0, 'rgba(242, 196, 106, 0.6)');
          grad.addColorStop(0.6, 'rgba(242, 196, 106, 0.15)');
          grad.addColorStop(1, 'rgba(242, 196, 106, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(8, -5);
          ctx.lineTo(45, -20);
          ctx.lineTo(45, 20);
          ctx.lineTo(8, 5);
          ctx.closePath();
          ctx.fill();

          // Outer Scout Pulse Aura
          const scoutPulse = Math.sin(animPhaseRef.current * 3) * 2;
          ctx.beginPath();
          ctx.arc(0, 0, 14 + scoutPulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(174, 172, 120, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Scout Drone Cross Wings
          ctx.strokeStyle = '#4C4541';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-9, -9);
          ctx.lineTo(9, 9);
          ctx.moveTo(-9, 9);
          ctx.lineTo(9, -9);
          ctx.stroke();

          // Thruster Pods (4 dots)
          const pods = [
            { x: -9, y: -9 },
            { x: 9, y: -9 },
            { x: 9, y: 9 },
            { x: -9, y: 9 }
          ];
          ctx.fillStyle = '#AEAC78';
          pods.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Center Navigator Orb Core
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#FCF0DA';
          ctx.shadowColor = '#F2C46A';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.strokeStyle = '#4C4541';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Center Compass Pointer Needle
          ctx.beginPath();
          ctx.moveTo(5, 0);
          ctx.lineTo(-3, -3);
          ctx.lineTo(-1, 0);
          ctx.lineTo(-3, 3);
          ctx.closePath();
          ctx.fillStyle = '#F2C46A';
          ctx.fill();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [depot, places, selectedNodeIndex, activeRoutes, currentSolver, compareMode, vehicleAnim, returnToStart]);

  return (
    <div className="map-canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="map-canvas-element"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />

      {/* Popper / Custom Tooltip */}
      {hoveredPlace && (
        <div
          className="map-node-tooltip"
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y - 15}px`
          }}
        >
          <div className="tooltip-header">
            <strong>{hoveredPlace.name}</strong>
            <span className="tooltip-badge">+{hoveredPlace.reward} Reward</span>
          </div>
          <div className="tooltip-details">
            <div>⏱️ Stay Time: <strong>{hoveredPlace.stayTime} min</strong></div>
            <div>📍 Category: <strong style={{ textTransform: 'capitalize' }}>{hoveredPlace.category || 'Spot'}</strong></div>
            <div>📐 Position: ({hoveredPlace.x}, {hoveredPlace.y})</div>
          </div>
        </div>
      )}

      {/* Canvas HUD Pill */}
      <div className="canvas-guide-overlay">
        <span>Click: <strong>Add Place</strong></span>
        <span>•</span>
        <span>Drag: <strong>Move</strong></span>
        <span>•</span>
        <span>R-Click: <strong>Delete</strong></span>
        <span>•</span>
        <span>Dbl-Click: <strong>Reward (+1)</strong></span>
      </div>

      {/* Legend */}
      <div className="canvas-spatial-legend">
        <div className="legend-row"><span className="legend-dot dp"></span> <span>DP Optimal Route</span></div>
        <div className="legend-row"><span className="legend-dot bb"></span> <span>Branch & Bound</span></div>
        <div className="legend-row"><span className="legend-dot greedy"></span> <span>Greedy Ratio</span></div>
        <div className="legend-row"><span className="legend-dot summit"></span> <span>Summit Reward R≥9</span></div>
      </div>
    </div>
  );
}
