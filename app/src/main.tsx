import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import '@fontsource/ia-writer-quattro/400.css'
import '@fontsource/ia-writer-quattro/700.css'
import '@fontsource/ia-writer-mono/400.css'
import './app/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
