import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

export function Loader({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            setTimeout(onFinished, 700);
          }, 200);
          return 100;
        }
        const increment = Math.floor(Math.random() * 15) + 8;
        return Math.min(100, prev + increment);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onFinished]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          className="app-loader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }}
        >
          {/* Top Curtain */}
          <motion.div
            className="loader-curtain-half top"
            exit={{ y: '-100%', transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          />
          {/* Bottom Curtain */}
          <motion.div
            className="loader-curtain-half bottom"
            exit={{ y: '100%', transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          />

          <div className="loader-center-content">
            {/* Circular SVG Progress Ring */}
            <div className="loader-ring-wrapper">
              <svg className="loader-svg" width="130" height="130" viewBox="0 0 130 130">
                <circle
                  className="loader-circle-bg"
                  cx="65"
                  cy="65"
                  r={radius}
                  strokeWidth="5"
                />
                <circle
                  className="loader-circle-progress"
                  cx="65"
                  cy="65"
                  r={radius}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="loader-icon-box">
                <Compass size={38} className="loader-compass-spin" />
              </div>
            </div>

            <motion.div
              className="loader-brand-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              BudgetTrail
              <span className="badge badge-aurora">
                <Sparkles size={11} /> Orienteering Solver
              </span>
            </motion.div>

            <div className="loader-progress-text">
              INITIALIZING SPATIAL OPTIMIZER • <span>{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
