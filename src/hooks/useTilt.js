import { useEffect, useRef } from 'react';

export function useTilt(options = {}) {
  const cardRef = useRef(null);

  const {
    maxTilt = 12,
    perspective = 1000,
    scale = 1.02,
    glare = true,
    maxGlare = 0.25
  } = options;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let glareEl = null;
    if (glare) {
      glareEl = document.createElement('div');
      glareEl.className = 'tilt-glare-effect';
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(glareEl);
    }

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;

      if (glareEl) {
        const percentageX = (x / rect.width) * 100;
        const percentageY = (y / rect.height) * 100;
        glareEl.style.opacity = `${maxGlare}`;
        glareEl.style.background = `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)`;
      }
    };

    const handleMouseLeave = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      if (glareEl) {
        glareEl.style.opacity = '0';
      }
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (glareEl) glareEl.remove();
    };
  }, [maxTilt, perspective, scale, glare, maxGlare]);

  return cardRef;
}
