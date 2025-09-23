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
        <svg 
          className="glyph glyph--light" 
          width="28" 
          height="28" 
          viewBox="0 0 128 128" 
          fill="none" 
          onError={(e) => console.error('Light mode SVG failed to load:', e)}
          onLoad={() => console.log('Light mode SVG loaded successfully')}
        >
          <circle cx="64" cy="64" r="30" fill="#FFF3CD" stroke="#887760" strokeWidth="2"/>
          <path d="M64 10 L64 25 M64 103 L64 118 M118 64 L103 64 M25 64 L10 64 M104 24 L93 35 M35 93 L24 104 M104 104 L93 93 M35 35 L24 24" stroke="#FFF3CD" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <svg 
          className="glyph glyph--dark" 
          width="28" 
          height="28" 
          viewBox="0 0 128 128" 
          fill="none"
          onError={(e) => console.error('Dark mode SVG failed to load:', e)}
          onLoad={() => console.log('Dark mode SVG loaded successfully')}
        >
          <path d="M64 20 C64 20 84 30 84 64 C84 98 64 108 64 108 C94 108 108 94 108 64 C108 34 94 20 64 20 Z" fill="#F6CB4A"/>
          <path d="M64 20 C34 20 20 34 20 64 C20 94 34 108 64 108 C64 108 44 98 44 64 C44 30 64 20 64 20 Z" fill="#0B1622"/>
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle;