/**
 * Application bootstrap.
 * Mounts the React tree onto the #root element from index.html. StrictMode
 * is on so double-invocation surfaces side-effect bugs early in dev.
 * Tailwind's compiled CSS is imported here so it loads before any component.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
