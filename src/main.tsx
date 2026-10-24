import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PaintApp from "./PaintApp.tsx"
import ZoomApp from './ZoomApp.tsx'
import App from './App.tsx'
import PaintAppOld from './PaintAppOld.tsx'
import NewZoomApp from "./NewZoomApp.tsx"


// 1. Wrapper for PaintApp
function MainWrapper() {
  const [allPolys, setAllPolys] = useState([]);
  const [polygonHistory, setPolygonHistory] = useState([]);

  return (
    <PaintApp 
      allPolys={allPolys} 
      setAllPolys={setAllPolys} 
      polygonHistory={polygonHistory} 
      setPolygonHistory={setPolygonHistory} 
      switchMode={() => console.log("Mode gewechselt")} 
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainWrapper />
  </StrictMode>,
)
