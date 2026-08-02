import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served as a GitHub Pages project site at ff8-speedruns.github.io/final-party-manip/
export default defineConfig({
  base: '/final-party-manip/',
  plugins: [react()],
  // The shared UI package is installed from git (and symlinked during local
  // development), so these can resolve from inside it as well as from here.
  // Two copies of React breaks every hook, and two copies of Mantine means the
  // provider's context is invisible to this app's components. Force one each.
  resolve: {
    dedupe: ['react', 'react-dom', '@mantine/core', '@mantine/hooks',
             '@mantine/dropzone', '@tabler/icons-react'],
  },
});
