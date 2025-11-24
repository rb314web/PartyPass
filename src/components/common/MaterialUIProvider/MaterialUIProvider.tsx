import React, { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { plPL } from '@mui/material/locale';
import CssBaseline from '@mui/material/CssBaseline';
import themeOptions from '../../../theme/themeOptions';
import { useThemeContext } from '../ThemeProvider/ThemeProvider';

export const MaterialUIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isDark } = useThemeContext();

  const theme = useMemo(
    () =>
      createTheme(
        {
          ...themeOptions,
          palette: {
            ...themeOptions.palette,
            mode: isDark ? 'dark' : 'light',
            primary: {
              main: isDark ? '#60a5fa' : '#1976d2', // Jaśniejszy niebieski dla dark mode
            },
            secondary: {
              main: isDark ? '#f472b6' : '#dc004e', // Jaśniejszy różowy dla dark mode
            },
          },
        },
        plPL // dodaje polskie tłumaczenia
      ),
    [isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MaterialUIProvider;
