import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend', // מגדיר ש-root של Vite נמצא בתוך ./frontend
  server: {
    port: 5173 // פורט ברירת מחדל של Vite, אפשר לשנות אם תפוס
  }
});
// אפשר להוסיף כאן הגדרות נוספות כמו plugins, build, וכו'