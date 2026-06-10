"use client";

import { ReactNode, useEffect, useState } from "react";
import DarkModeSwitch from "./DarkModeSwitch";
import { DARK_MODE_STORAGE_KEY, DarkModeContext } from "../hooks/useDarkMode";

const applyTheme = (isDark: boolean) => {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
};

type DarkModeProviderProps = {
  children: ReactNode;
};

const DarkModeProvider = ({ children }: DarkModeProviderProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
    setIsDark(stored);
    applyTheme(stored);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(next));
      applyTheme(next);
      return next;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      <DarkModeSwitch />
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider;
