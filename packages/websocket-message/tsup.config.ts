import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['websocket-message.ts'],
  format: ['esm'],
  target: 'node20',
  dts: true,
  clean: true,
});
