import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['result.ts'],
  format: ['esm'],
  target: 'node20',
  dts: true,
  clean: true,
});
