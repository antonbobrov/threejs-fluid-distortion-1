/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  root: 'src',
  base: '',
  publicDir: '../public',
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
  plugins: [glsl()],
});
