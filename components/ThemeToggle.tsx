import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import lightIconUrl from '@/assets/light mode.svg';
import darkIconUrl from '@/assets/dark mode.svg';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pearlRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const toggle = toggleRef.current;
    const pearl = pearlRef.current;
    
    if (!toggle || !pearl) return;

    // Compute exact travel so the fixed-size knob never leaks
    const computeTravel = () => {
      const s = getComputedStyle(toggle);
      // Prefer actual rendered sizes for robustness on mobile
      const padL = parseFloat(s.paddingLeft) || parseFloat(s.getPropertyValue('--pad')) || 6;
      const padR = parseFloat(s.paddingRight) || parseFloat(s.getPropertyValue('--pad')) || padL;
      const w = toggle.clientWidth || parseFloat(s.width) || parseFloat(s.getPropertyValue('--toggle-w')) || 116;
      const ps = getComputedStyle(pearl);
      const knob = pearl.offsetWidth || parseFloat(ps.width) || parseFloat(s.getPropertyValue('--knob')) || 44;
      const travel = Math.max(0, w - (padL + padR + knob));
      pearl.style.setProperty('--travel', travel + 'px');
    };

    computeTravel();
    window.addEventListener('resize', computeTravel);

    return () => {
      window.removeEventListener('resize', computeTravel);
    };
  }, []);

  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;

    // Update toggle state based on theme
    const isDark = theme === 'dark';
    toggle.classList.toggle('is-dark', isDark);
    toggle.setAttribute('aria-pressed', String(isDark));
  }, [theme]);

  const handleClick = () => {
    const toggle = toggleRef.current;
    if (!toggle) return;

    console.log('Theme toggle clicked, current theme:', theme);
    
    // Add morphing animation
    toggle.classList.add('morphing');
    toggleTheme();
    
    // Remove morphing class after animation
    setTimeout(() => {
      toggle.classList.remove('morphing');
    }, 620);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={toggleRef}
      id="themeToggle"
      className="toggle"
      aria-pressed={theme === 'dark'}
      aria-label="Toggle dark mode"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="track"></span>
      <span className="sweep"></span>
      <span ref={pearlRef} className="pearl">
        <span className="glyph glyph--light">
          <img src={lightIconUrl} alt="" aria-hidden="true" />
        </span>
        <span className="glyph glyph--dark">
          <img src={darkIconUrl} alt="" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;