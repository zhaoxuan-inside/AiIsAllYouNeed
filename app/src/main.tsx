import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/700.css'
import './app/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
