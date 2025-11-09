import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/arimakomi.github.io/' // یا '/' اگر با دامنه سفارشی
});
