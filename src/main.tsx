import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ZoomApp from './ZoomApp.tsx'
import App from './App.tsx'
import PaintAppOld from './PaintAppOld.tsx'
import PaintApp from "./PaintApp.tsx"
import NewZoomApp from "./NewZoomApp.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NewZoomApp />
  </StrictMode>,
)
