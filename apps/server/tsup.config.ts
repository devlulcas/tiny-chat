import { defineConfig } from 'tsup';

// NODE ESM
export default defineConfig({
  entryPoints: ['server.ts'],
  format: ['esm'],
  target: 'node20',
});
