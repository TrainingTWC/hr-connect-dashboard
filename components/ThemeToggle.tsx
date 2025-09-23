import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

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
      const pad = parseFloat(s.getPropertyValue('--pad'));
      const w = parseFloat(s.getPropertyValue('--toggle-w'));
      const knob = parseFloat(s.getPropertyValue('--knob'));
      const travel = w - (pad * 2 + knob);
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
        <img className="glyph glyph--light" src="/toggle/assets/light mode.svg" alt="Light" />
        <img className="glyph glyph--dark" src="/toggle/assets/dark mode.svg" alt="Dark" />
      </span>
    </button>
  );
};

export default ThemeToggle;