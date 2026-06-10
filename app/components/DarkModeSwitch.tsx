"use client";

import { useDarkMode } from "../hooks/useDarkMode";

const DarkModeSwitch = () => {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="theme-switch fixed right-0 top-0 z-50 m-4 flex items-center gap-2"
    >
      <span className={`theme-piece flex items-center gap-1 text-xs ${!isDark ? "opacity-100" : "opacity-40"}`}>
        <span aria-hidden="true">☀️</span>
      </span>
      <span className="theme-switch-track relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors">
        <span
          className={`theme-switch-thumb inline-block h-4 w-4 rounded-full transition-transform ${
            isDark ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      <span className={`theme-piece flex items-center gap-1 text-xs ${isDark ? "opacity-100" : "opacity-40"}`}>
        <span aria-hidden="true">🌙</span>
      </span>
    </button>
  );
};

export default DarkModeSwitch;
