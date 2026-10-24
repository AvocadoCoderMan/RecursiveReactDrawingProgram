import React, { useState } from 'react';
import PaintApp from './PaintApp';
import ZoomApp from './ZoomApp';

function App() {
  type Polygon = {
  points: number[];
  fill: string;
  name: string;
  id: string;
  children: Polygon[]; // same structure recursively
};
  const [mode, setMode] = useState<'paint' | 'view'>('paint');
  const [allPolys, setAllPolys] = useState<Polygon[]>([]);
  const [polygonHistory, setPolygonHistory] = useState<
      { points:number[]; fill: string; name:string;id:string}[]>([]);2
  return (
    <div>
      {mode === 'paint' ? 
      (
        <>
          <PaintApp allPolys={allPolys} setAllPolys={setAllPolys} polygonHistory={polygonHistory} setPolygonHistory={setPolygonHistory} switchMode={()=>setMode("view") }/>
        </>
      ) : (
        <>
        <button onClick={() =>{ 
          setPolygonHistory(allPolys.map(poly => ({
            id: poly.id,
            points: poly.points,
            name: poly.name,
            fill: poly.fill,
          })));
          setMode('paint')}}
          style={{float:"right", margin:"10px"}}
          >
          Edit
        </button>
        <div style={{clear:"both"}}>

        </div>
        <ZoomApp allPolys={allPolys} />
        </>
      )}
    </div>
  );
}

export default App;
