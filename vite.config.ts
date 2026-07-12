/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', 'VITE_']);
  const processEnv: Record<string, string> = {
    NODE_ENV: mode === 'production' ? 'production' : 'development',
    ...env,
  };

  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify(processEnv),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('react-router') ||
              id.includes('scheduler/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('/firebase/') || id.includes('@firebase/')) {
              if (
                id.includes('firebase/storage') ||
                id.includes('@firebase/storage')
              ) {
                return 'vendor-firebase-storage';
              }
              if (
                id.includes('firebase/functions') ||
                id.includes('@firebase/functions')
              ) {
                return 'vendor-firebase-functions';
              }
              if (
                id.includes('firebase/analytics') ||
                id.includes('@firebase/analytics')
              ) {
                return 'vendor-firebase-analytics';
              }
              if (
                id.includes('firebase/auth') ||
                id.includes('@firebase/auth')
              ) {
                return 'vendor-firebase-auth';
              }
              if (
                id.includes('firebase/firestore') ||
                id.includes('@firebase/firestore')
              ) {
                return 'vendor-firebase-firestore';
              }
              return 'vendor-firebase-core';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('@emailjs/')) {
              return 'vendor-emailjs';
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true,
      exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
      },
    },
  };
});
