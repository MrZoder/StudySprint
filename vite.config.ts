import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { aiPlannerDevPlugin } from './server/vitePlugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env / .env.local into process.env so the server-side AI Planner
  // handler can read OPENAI_API_KEY and related variables during development
  // without leaking them to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('OPENAI_') || key.startsWith('AI_PLANNER_')) {
      process.env[key] = value
    }
  }

  return {
    plugins: [react(), tailwindcss(), aiPlannerDevPlugin()],
  }
})
