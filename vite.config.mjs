import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/starly-mini/'  // اگر دامنه سفارشی داری، آن را جایگزین کن
});
