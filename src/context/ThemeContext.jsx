// ThemeContext has been deprecated as CampusConnect strictly adheres to a single light design system.
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({ isDark: false, toggle: () => {} });

export const ThemeProvider = ({ children }) => {
  return <ThemeContext.Provider value={{ isDark: false, toggle: () => {} }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
