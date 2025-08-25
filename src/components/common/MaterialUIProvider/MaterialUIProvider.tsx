import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { plPL } from '@mui/material/locale';
import CssBaseline from '@mui/material/CssBaseline';
import themeOptions from '../../../theme/themeOptions';

const theme = createTheme(
  themeOptions,
  plPL, // dodaje polskie tłumaczenia
);

export const MaterialUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MaterialUIProvider;
