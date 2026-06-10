"use client";

import { createContext, useContext } from "react";

export const DARK_MODE_STORAGE_KEY = "tic-tac-toe-dark-mode";

type DarkModeContextValue = {
  isDark: boolean;
  toggle: () => void;
};

export const DarkModeContext = createContext<DarkModeContextValue>({
  isDark: false,
  toggle: () => {}
});

export const useDarkMode = () => useContext(DarkModeContext);
