import React, {useRef, useState, useEffect} from 'react';
import { Stage, Layer, Text, Line, Circle } from 'react-konva';
import type Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuidv4 } from 'uuid';

const blockSize = 25;

function App() {
  const stageRef = useRef<Konva.Stage>(null);
  const [polygonHistory, setPolygonHistory] = useState<
    { points:number[]; fill: string; name:string;id:string }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const emptyPolygon = {points: [],fill: "black",name: "test", id:" "};
  const [activePolygon, setActivePolygon] = useState<{points: number[];fill: string;name: string; id:string}>({points: [],fill: "#000000",name: "test", id:"standard"});
  const isDrawingRef = useRef(isDrawing);
const activePolygonRef = useRef(activePolygon);
  const [selectedColor, setSelectedColor] = useState<string>(activePolygon.fill);
  const [SnapCircle, setSnapCircle]=useState({x:0,y:0})
  const [editingPolyId, setEditingPolyId]=useState("")
  const [editButtonPosition,setEditButtonPosition]=useState([0,0])
  const [mousePos,setMousePos]=useState([0,0])
  const [polyName, setPolyName]=useState("")
  const getSnappedPos = (x: number, y: number) => ({
    x: Math.round((x-blockSize/5) / blockSize) * blockSize,
    y: Math.round((y-blockSize/5  ) / blockSize) * blockSize,
  }); 

  function clientToStageCoords(clientX: number, clientY: number, stageRef: React.RefObject<Konva.Stage|null>) {
  if (!stageRef.current) return { x: 0, y: 0 };

  const rect = stageRef.current.container().getBoundingClientRect();

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

  function pointIsCorrect(x:number,y:number){
    
    function isPointInPolygon(x: number, y: number, polygon: number[]): boolean {
          
          let inside = false;
          const n = polygon.length;

          for (let i = 0, j = (n / 2 - 1); i < n / 2; j = i++) {
            const xi = polygon[i * 2], yi = polygon[i * 2 + 1];
            const xj = polygon[j * 2], yj = polygon[j * 2 + 1];

            const intersect =
              yi > y !== yj > y &&
              x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-10) + xi;

            if (intersect) inside = !inside;
          }
          return inside;
        }
    function pointOnAnyPolygonLine(x: number, y: number, polygon: number[]): boolean {
      function pointOnLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
  const tolerance = 1e-6;

  // Calculate area of triangle and check if it's ~0 (colinear)
  const area = Math.abs((x2 - x1) * (py - y1) - (px - x1) * (y2 - y1));
  if (area > tolerance) return false;

  // Check if point is within the bounding box of the segment
  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
  return px >= minX - tolerance && px <= maxX + tolerance &&
         py >= minY - tolerance && py <= maxY + tolerance;
    }
      const n = polygon.length / 2;
      for (let i = 0; i < n; i++) {
        const x1 = polygon[i * 2];
        const y1 = polygon[i * 2 + 1];
        const j = (i + 1) % n;
        const x2 = polygon[j * 2];
        const y2 = polygon[j * 2 + 1];

        if (pointOnLine(x, y, x1, y1, x2, y2)) {
          return true;
        }
      }
      return false;
    }

    //Wenn die 

      for (const element of polygonHistory) {
    if (isPointInPolygon(x,y, element.points)&&!pointOnAnyPolygonLine(x,y, element.points)) {return false;}
      }
    return true
  }
  function lineIsCorrect():boolean{
    function lastPointOnAnySegment(points: number[], excludePoints: number[][]): number[] | null {
  function isPointOnSegment(
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): boolean {
    const cross = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1);
    if (Math.abs(cross) > 1e-6) return false; // Not on line

    const dot = (px - x1) * (px - x2) + (py - y1) * (py - y2);
    return dot <= 0; // Between endpoints
  }

  if (points.length < 6) return null; // Need at least 2 segments

  const px = points[points.length - 2];
  const py = points[points.length - 1];

  for (let i = 0; i < points.length - 4; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    const x2 = points[i + 2];
    const y2 = points[i + 3];

    // Check if this segment should be excluded
    const isExcluded = excludePoints.some(
      ([ex1, ey1, ex2, ey2]) =>
        x1 === ex1 && y1 === ey1 && x2 === ex2 && y2 === ey2
    );
    if (isExcluded) {
     continue};

    if (isPointOnSegment(px, py, x1, y1, x2, y2)) {
      return [x1, y1, x2, y2];
    }
  }

  return null;
}

    function doesLastLineIntersect(points: number[], excludePoints:number[][]): boolean {
      function linesIntersect(x1: number, y1: number, x2: number, y2: number,
                            x3: number, y3: number, x4: number, y4: number): boolean {
      function ccw(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
        return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
      }
        if(
        ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
        ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4)
        )return true;
        return false
    }
  if (points.length < 8) return false; // Need at least two segments to compare
  const len = points.length;
  const x3 = points[len - 4];
  const y3 = points[len - 3];
  const x4 = points[len - 2];
  const y4 = points[len - 1];
  let shouldcontinue =false
  // Check last line against all previous lines (except adjacent)
  for (let i = 0; i <= len - 8; i += 2) {
    const x1 = points[i];
    const y1 = points[i + 1];
    const x2 = points[i + 2];
    const y2 = points[i + 3];
    for (let index = 0; index < excludePoints.length; index++) {
      if([x1,y1,x2,y2].join("")== excludePoints[index].join("")){shouldcontinue=true;
      }
    }
    if(shouldcontinue) {shouldcontinue=false; continue}
    if (linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) {
      return true;
    }
  }
  return false;
    }
    function isLastPointDuplicate(points: number[]): boolean {
  if (points.length < 4) return false; // Need at least two points to compare

  const lastX = points[points.length - 2];
  const lastY = points[points.length - 1];

  for (let i = 0; i < points.length - 2; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    if (x === lastX && y === lastY) {
      return true;
    }
  }

  return false;
    }
    function doesLastSegmentContainAnyPoint(points: number[]): boolean {
      if (points.length < 6) return false; // Need at least one earlier point and a final segment

      const x1 = points[points.length - 4];
      const y1 = points[points.length - 3];
      const x2 = points[points.length - 2];
      const y2 = points[points.length - 1];

      // Helper: is a point exactly on the segment?
      function isPointOnSegment(px: number, py: number): boolean {
        const cross = (py - y1) * (x2 - x1) - (px - x1) * (y2 - y1);
        if (Math.abs(cross) > 1e-6) return false; // Not colinear

        const dot = (px - x1) * (px - x2) + (py - y1) * (py - y2);
        return dot < 0; // Strictly between x1,y1 and x2,y2
      }

      for (let i = 0; i < points.length - 4; i += 2) {
        const px = points[i];
        const py = points[i + 1];
        if (isPointOnSegment(px, py)) {
          return true;
        }
      }

      return false;
    }

    const StartX=activePolygon.points[activePolygon.points.length-4]
    const StartY=activePolygon.points[activePolygon.points.length-3]
    const EndX=activePolygon.points[activePolygon.points.length-2]
    const EndY=activePolygon.points[activePolygon.points.length-1]
    const isEndpoint=activePolygon.points[0]==EndX&&activePolygon.points[1]==EndY
    let StartOnLine:string[]=[]
    let intersectExcluders:number[][]=[]
    let pointOnExcluders:number[][]=[]
    // check wenn die auf einer linie, sind falls ja rcursive um ecken zu finden
    function checkOn(){
    for (const element of polygonHistory) {
      const result = lastPointOnAnySegment([...element.points, element.points[0], element.points[1], StartX, StartY],intersectExcluders);
      // zu intersectExcluders die linie wo er drauf anfängt
      if (result){
        intersectExcluders.push(result)
        StartOnLine.push(element.id)
        checkOn()
        
      }
      // zu intersectExcluders die linie wo er drauf ist 
      const resultNew=lastPointOnAnySegment([...element.points, element.points[0], element.points[1], EndX,EndY],intersectExcluders)
      if(resultNew){
          intersectExcluders.push(resultNew)
          checkOn()
      }
    }
  }
  checkOn()
  //wenn start auf linie nicht in den eigenen auser auf der linie wo er drauf ist + ecken.
  let returner =true
  for (let index = 0; index < StartOnLine.length; index++) {
    const PolygonID = StartOnLine[index];
    const element=polygonHistory.find((poly)=>poly.id==PolygonID)
    if (!element)continue
    if(StartOnLine.includes(element.id)){
      if(lastPointOnAnySegment([...element.points, element.points[0], element.points[1], EndX,EndY], intersectExcluders)){
          
        returner=false
      }
    }
    if(!returner){ return false}
  }

  for (const element of polygonHistory) {
    if(doesLastLineIntersect([...element.points, element.points[0], element.points[1],StartX,StartY,EndX,EndY],intersectExcluders)){
      if(!doesLastSegmentContainAnyPoint([...element.points, element.points[0], element.points[1],StartX,StartY,EndX,EndY])){
      return false
    }}
    if(!pointIsCorrect(EndX,EndY))return false
  }
    
  if(isEndpoint&&!doesLastLineIntersect(activePolygon.points.slice(2,activePolygon.points.length),[]))return true
  if(doesLastLineIntersect(activePolygon.points,[])||lastPointOnAnySegment([...activePolygon.points],[])){return false}
    
    return true
  }

  function addLine(x:number,y:number){
    if(!lineIsCorrect())return
    setActivePolygon((prev) =>(
            {
                ...prev,
                points:[...prev.points, x,y],
              }
        ))
  }

  const handleMouseDown = (e:KonvaEventObject<MouseEvent>) => {
    const newId = uuidv4();
    if (e.evt.button !== 0) return;
    setEditingPolyId("")
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    const { x, y } = getSnappedPos(pos.x, pos.y);
    if (isDrawing){
    if(activePolygon.points[0]==x&&activePolygon.points[1]==y){//startpunkt
      if(activePolygon.points.length<8||!lineIsCorrect()){return}//noch nicht 2 punkte
      //activepolyogn in history activeoplygon reset
      setIsDrawing(false)
      setPolygonHistory([
        ...polygonHistory,
        {
          ...activePolygon,
          points:activePolygon.points.slice(0,activePolygon.points.length-2)

        }
      ])
      setActivePolygon(emptyPolygon)
      return
    }
      if(activePolygon.points[activePolygon.points.length-3]==y&&activePolygon.points[activePolygon.points.length-4]==x)return//wenn gleich wie letzter Punkt
      // hier normal
      addLine(x,y);
      
    }
    else{//erstes mal 2 mal
      if(!pointIsCorrect(x,y))return
    setActivePolygon((prev) =>(
         {
            ...prev,
            points:[...prev.points, x,y,x,y],
            name:"Poly"+polygonHistory.length.toString(),
            id:newId
          }
    ))
  }
  setIsDrawing(true);
  }

  const handleMouseMove = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    const snapped = getSnappedPos(pos.x, pos.y);
    setSnapCircle(snapped)
    
    if (!isDrawing || !activePolygon) return;
    
    setActivePolygon((prev) => {
      const updatedPoints = [...prev.points]; // make a copy
      if (updatedPoints.length >= 2) {
        updatedPoints[updatedPoints.length - 2] = snapped.x; // update x
        updatedPoints[updatedPoints.length - 1] = snapped.y; // update y
      }
      
      return {
        ...prev,
        points: updatedPoints,
      };
    });
  }
  function rightClickedPoly(e:KonvaEventObject<MouseEvent>){
    if(isDrawing)return
    if(editingPolyId){setEditingPolyId("");return}
    setEditButtonPosition([stageRef.current?.getRelativePointerPosition()?.x||0, stageRef.current?.getRelativePointerPosition()?.y||0])
    setEditingPolyId(e.target.id())
    setPolyName(polygonHistory.find((newE) => newE.id === e.target.id())?.name||"") 
  }

  function clickDelete(){
    setActivePolygon(emptyPolygon)
    setIsDrawing(false)
    setPolygonHistory(polygonHistory.filter((a)=>(
      a.id!=editingPolyId
    )))
    setEditingPolyId("")
  }
  function clickEdit(){
    setIsDrawing(true)
    let found = polygonHistory.find((e) => e.id === editingPolyId);
    if (found) {
      const pos=clientToStageCoords(mousePos[0], mousePos[1], stageRef)
      const snapped = getSnappedPos(pos.x, pos.y);
      found.points.push(snapped.x,snapped.y)
      setActivePolygon(found);
      setSnapCircle(snapped)
      
    }
    setPolygonHistory(polygonHistory.filter((a)=>(
      a.id!=editingPolyId
    )))
    setEditingPolyId("")
  }
  function clickOpen(){
    setEditingPolyId("")
  }
  function changeName(e:React.ChangeEvent<HTMLInputElement>){
    let newName=e.target.value
    const newHistory=polygonHistory.map((poly)=>{
      if(poly.id===editingPolyId){
        return({...poly,name:newName})
      }
      else{
        return (poly)
      }
    })
    setPolyName(newName)
    setPolygonHistory(newHistory) 
  }


useEffect(() => {
  isDrawingRef.current = isDrawing;
}, [isDrawing]);

useEffect(() => {
  activePolygonRef.current = activePolygon;
}, [activePolygon]);
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsDrawing(false);
      setActivePolygon(emptyPolygon);
      setEditingPolyId("")
    } 
    else if (e.key === "Backspace") {
      if (isDrawingRef.current) {
        
        const currentPoints = activePolygonRef.current.points;
        if (currentPoints.length <= 4) {
          setActivePolygon(emptyPolygon);
          setIsDrawing(false);
        } 
        else {
          const newPoints = currentPoints.slice(0, -4); // remove last point
          const pos = stageRef.current?.getPointerPosition();
          if (!pos) return;
          const snapped = getSnappedPos(pos.x, pos.y);
          newPoints.push(snapped.x,snapped.y)
          setActivePolygon({ ...activePolygonRef.current, points: newPoints });
        }
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
  return (
    <>
      <div style={{ margin: 10 }}>
        <label htmlFor="color" style={{color:selectedColor}}>Choose color: </label>
        <input
          id="color"
          type="color"
          value={selectedColor}
          onChange={(e) => {setActivePolygon({...activePolygon, fill:e.target.value}); setSelectedColor(e.target.value)}}
        />
        <button onClick={()=>{setActivePolygon(emptyPolygon);setPolygonHistory([]); setIsDrawing(false); setEditingPolyId("");}} style={{margin:10}}>reset</button>
      </div>
      {editingPolyId&&(
            <div className='editButtonDiv'  style={{left:editButtonPosition[0], top:editButtonPosition[1]}} onMouseMove={(e)=>setMousePos([e.clientX, e.clientY])}>
            <div className="editButtons">
            <label className="">Name</label>
            <input className='' type="text" onChange={changeName} value={polyName} />
            </div>
            <button className='editButtons' onClick={clickDelete}>delete</button>
            <button className='editButtons' onClick={clickEdit}>edit</button>
            <button className='editButtons' onClick={clickOpen}>open</button>
            </div>
          )}
      <Stage
        width={1400}
        height={700}
        ref={stageRef}
        onMouseDown={(e)=>{handleMouseDown(e)}} 
        onMouseMove={handleMouseMove}
      >
        <Layer listening={false}>
          <InfiniteGrid blockSize={blockSize} />
        </Layer>
        <Layer>
          {stageRef.current?.getPointerPosition()&& !editingPolyId&&(
            <Circle
              fill={"red"}
              x={SnapCircle.x}
              y={SnapCircle.y}
              radius={4}
            />
          )}
          <PolygonHistory polygonHistory={polygonHistory} rightClickedPoly={rightClickedPoly}/> 
          {isDrawing && (
            <><Line
            {...activePolygon}
            stroke={"green"}
            points={activePolygon.points.slice(0,-2)}
            />
            <Line
            {...activePolygon}
            stroke={lineIsCorrect()?"green":"red"}
            points={activePolygon.points.slice(-4,activePolygon.points.length)}
            />
            {isDrawing&&
            <Circle
              fill={"green"}
              x={activePolygon.points[0]}
              y={activePolygon.points[1]}
              radius={5}
            />
            }
            </>
          )}
        </Layer>
      </Stage>
    </>
  );
}

function InfiniteGrid({ blockSize }: { blockSize: number }) {
  const lines = [];
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let x = 0; x < width; x += blockSize) {
    lines.push(<Line key={`v-${x}`} points={[x, 0, x, height]} stroke="rgb(88, 88, 88)" strokeWidth={1} />);
  }
  for (let y = 0; y < height; y += blockSize) {
    lines.push(<Line key={`h-${y}`} points={[0, y, width, y]} stroke="rgb(88, 88, 88)" strokeWidth={1} />);
  }

  return <>{lines}</>;
}

function PolygonHistory({
  polygonHistory,
  rightClickedPoly,
}: {
  polygonHistory: { points: number[]; fill: string; name: string }[];
  rightClickedPoly: (evt: KonvaEventObject<MouseEvent>) => void;
}) {
  const textRefs = useRef<Konva.Text[]>([]);
  const [textSizes, setTextSizes] = useState<{ width: number; height: number }[]>(
    []
  );

  function getPolygonCenter(points: number[]) {
    const n = points.length / 2;
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < n; i++) {
      sumX += points[i * 2];
      sumY += points[i * 2 + 1];
    }

    return {
      x: sumX / n,
      y: sumY / n,
    };
  }

  useEffect(() => {
    const newSizes = textRefs.current.map((ref) =>
      ref ? { width: ref.width(), height: ref.height() } : { width: 0, height: 0 }
    );
    setTextSizes(newSizes);
  }, [polygonHistory]);

  return polygonHistory.map((rect, i) => {
    const center = getPolygonCenter(rect.points);
    return (
      <React.Fragment key={i}>
        <Line
          key={`line-${i}`}
          {...rect}
          stroke="red"
          closed
          strokeWidth={1}
          fill={rect.fill}
          onContextMenu={(e) => {
            e.cancelBubble = true;
            e.evt.preventDefault();
            rightClickedPoly(e);
          }}
        />
        <Text
          key={`text-${i}`}
          ref={(el) => {
            if (el) textRefs.current[i] = el;
          }}
          x={center.x}
          y={center.y}
          offsetX={(textSizes[i]?.width ?? 0) / 2}
          offsetY={(textSizes[i]?.height ?? 0) / 2}
          text={rect.name}
          fontSize={20}
          fill="white"
          listening={false}
          name={rect.name}
        />
      </React.Fragment>
    );
  });
}


export default App;
