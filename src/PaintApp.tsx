import React, {useRef, useState, useEffect} from 'react';
import { Stage, Layer, Text, Line, Circle, Shape } from 'react-konva';
import type Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuidv4 } from 'uuid';

type Polygon = {
  points: number[];
  fill: string;
  name: string;
  id: string;
  children: Polygon[]; // same structure recursively
};
type SmallPolygon={
  points: number[];
  fill: string;
  name: string;
  id: string;
}

function PaintApp({ allPolys, setAllPolys, polygonHistory, setPolygonHistory ,switchMode}: { allPolys: Polygon[], setAllPolys: (p: Polygon[]) => void , polygonHistory:SmallPolygon[], setPolygonHistory:(p:SmallPolygon[])=>void , switchMode:()=>void}) {
  const emptyPolygon = {points: [],fill: "#000000",name: "", id:""};
  const stageRef = useRef<Konva.Stage>(null);
  const [blockSize, setBlockSize]=useState(25)
  const [isDrawing, setIsDrawing] = useState(false);
  const [activePolygon, setActivePolygon] = useState<{points: number[];fill: string;name: string; id:string}>({points: [],fill: "#000000",name: "test", id:"standard"});
  const isDrawingRef = useRef(isDrawing);
const activePolygonRef = useRef(activePolygon);
  const [selectedColor, setSelectedColor] = useState<string>(activePolygon.fill);
  const [lineWidth,setLineWidth]=useState(1)
  const [SnapCircle, setSnapCircle]=useState({x:0,y:0})
  const [editingPolyId, setEditingPolyId]=useState("")
  const [editButtonPosition,setEditButtonPosition]=useState([0,0])
  const [mousePos,setMousePos]=useState([0,0])
  const [polyName, setPolyName]=useState("")
  const [openedPoly, setOpenedPoly]=useState<{points: number[];fill: string;name: string; id:string}>({points: [],fill: "#000000",name: "", id:""});


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
    function isPointOnLine(
  line: [number, number, number, number],
  xa: number,
  ya: number
): boolean {
  const [x1, y1, x2, y2] = line;

  // Check if area of triangle formed is zero (i.e., they are colinear)
  const cross = (xa - x1) * (y2 - y1) - (ya - y1) * (x2 - x1);
  if (Math.abs(cross) > 1e-10) return false; // not colinear

  // Check if the point is within the bounds of the segment
  const withinX = xa >= Math.min(x1, x2) && xa <= Math.max(x1, x2);
  const withinY = ya >= Math.min(y1, y2) && ya <= Math.max(y1, y2);

  return withinX && withinY;
    }

    //Wenn die Anzahl auf Linien auf der sie ist größer ist als die ANzahl der Punkte aiuf der se ist, false, 
    let isOnLines=0
    let isOnPoints=0
    let isInPoly=false
    for (let index = 0; index < polygonHistory.length; index++) {
        const poly = polygonHistory[index];
        if(isPointInPolygon(x,y,poly.points)){isInPoly=true}
        for (let i = 0; i < poly.points.length; i+=2) {
            const segment = poly.points.slice(i, i+4);
            let line: [number, number, number, number] = segment as [number, number, number, number];
            if (i==poly.points.length-2){line=[poly.points[i],poly.points[i + 1],poly.points[0],poly.points[1]]}  //mach startpunkt zur letzten linie
            if((x==line[0]&&y==line[1])||(x==line[2]&&y==line[3])){isOnPoints++} //wenn auf einem Eckk
            if(isPointOnLine(line,x,y)){isOnLines++;isInPoly=false}
        }
        if(isInPoly){return false}
        if(isOnLines>1&&isOnLines>isOnPoints){     return false}
        isOnLines=0
        isOnPoints=0
    }
    if(openedPoly.id&&(!isPointInPolygon(x,y,openedPoly.points))){
      for (let i = 0; i < openedPoly.points.length; i+=2) {
        const segment = openedPoly.points.slice(i, i+4);
            let line: [number, number, number, number] = segment as [number, number, number, number];
            if (i==openedPoly.points.length-2){line=[openedPoly.points[i],openedPoly.points[i + 1],openedPoly.points[0],openedPoly.points[1]]}  //mach startpunkt zur letzten linie
            if(isPointOnLine(line,x,y))return true
      }
      return false
    }
    return true
  }

  function lineIsCorrect():boolean{
    type Point = [number, number];

    function isPointOnLine(
  line: [number, number, number, number],
  xa: number,
  ya: number
): boolean {
  const [x1, y1, x2, y2] = line;

  // Check if area of triangle formed is zero (i.e., they are colinear)
  const cross = (xa - x1) * (y2 - y1) - (ya - y1) * (x2 - x1);
  if (Math.abs(cross) > 1e-10) return false; // not colinear

  // Check if the point is within the bounds of the segment
  const withinX = xa >= Math.min(x1, x2) && xa <= Math.max(x1, x2);
  const withinY = ya >= Math.min(y1, y2) && ya <= Math.max(y1, y2);

  return withinX && withinY;
    }
    function doLinesCross(
  line1: [number, number, number, number],
  line2: [number, number, number, number]
): boolean {
  const [x1, y1, x2, y2] = line1;
  const [x3, y3, x4, y4] = line2;

  const a: Point = [x1, y1];
  const b: Point = [x2, y2];
  const c: Point = [x3, y3];
  const d: Point = [x4, y4];

  function ccw(p: Point, q: Point, r: Point): boolean {
    return (r[1] - p[1]) * (q[0] - p[0]) > (q[1] - p[1]) * (r[0] - p[0]);
  }

  const intersect =
    ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);

  return intersect;
    }


    const StartX=activePolygon.points[activePolygon.points.length-4]
    const StartY=activePolygon.points[activePolygon.points.length-3]
    const EndX=activePolygon.points[activePolygon.points.length-2]
    const EndY=activePolygon.points[activePolygon.points.length-1]
    const isEndpoint=activePolygon.points[0]==EndX&&activePolygon.points[1]==EndY
    for (let index = 0; index < polygonHistory.length; index++) {
        const poly = polygonHistory[index];
        for (let i = 0; i < poly.points.length; i+=2) {
            const segment = poly.points.slice(i, i+4);
            let line: [number, number, number, number] = segment as [number, number, number, number];
            if (i==poly.points.length-2){line=[poly.points[i],poly.points[i + 1],poly.points[0],poly.points[1]]} 
            if(isPointOnLine(line,StartX,StartY)){continue}
            if(isPointOnLine(line,EndX,EndY)){continue}
            if(isPointOnLine([EndX,EndY,StartX,StartY],line[2], line[3])||isPointOnLine([EndX,EndY,StartX,StartY],line[0], line[1])){continue}
            if(doLinesCross(line,[EndX,EndY,StartX,StartY])){return false}
        }
    }
    const poly = activePolygon;
    for (let i = 0; i < poly.points.length-4; i+=2) {
        const segment = poly.points.slice(i, i+4);
        let line: [number, number, number, number] = segment as [number, number, number, number];
        if (i==poly.points.length-2){line=[poly.points[i],poly.points[i + 1],poly.points[0],poly.points[1]]} 
        if(doLinesCross(line,[EndX,EndY,StartX,StartY])){return false}
        if((isPointOnLine([StartX,StartY,EndX,EndY],line[0], line[1])&&!isEndpoint||isPointOnLine([StartX,StartY,EndX,EndY],line[0], line[1])&&!isEndpoint)){return false}  
        
    }


    if(!pointIsCorrect(EndX,EndY)){return false}
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
    console.log(allPolys);
    
    const newId = uuidv4();
    if (e.evt.button !== 0) return;
    setEditingPolyId("")
    const pos = getmousepos()
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
          points:activePolygon.points.slice(0,activePolygon.points.length-2),
        }
      ])
      setActivePolygon({...emptyPolygon, fill:selectedColor})
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
  function getmousepos(){
    const pointerPos = stageRef.current?.getPointerPosition();
if (!pointerPos || !stageRef.current) {
  // no pointer position or stage not ready
  return null;
}

// adjust for zoom and pan:
  const stageX = (pointerPos.x - stageRef.current.x()) / stageRef.current.scaleX();
  const stageY = (pointerPos.y - stageRef.current.y()) / stageRef.current.scaleY();
  return{x:stageX, y:stageY}
  }
  const handleMouseMove = () => {
    
    const pos=getmousepos()
    if (!pos) return;
    const snapped = getSnappedPos(pos.x,pos.y)
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
    // TODO: nur wenn leer, ansonsten alert delete children? wenn ja 
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

  function clickOpen() {
  if(getDepthOfPolygon(allPolys, openedPoly.id)>6){
    alert("too deep")
    return
  }
  SaveToAllPolys();
  const found = findPolygonById(allPolys, editingPolyId);

  if (!found) {
    const foundInHistory = polygonHistory.find(poly => poly.id === editingPolyId);
    if (!foundInHistory) return;

    setOpenedPoly({
      fill: foundInHistory.fill,
      points: foundInHistory.points,
      name: foundInHistory.name,
      id: foundInHistory.id,
    });
    setPolygonHistory([]);
    if (!stageRef.current) return;
    setEditingPolyId("");
    setBlockSize(blockSize*0.5)
    zoomToPolygon(stageRef.current, foundInHistory.points)
    return;
  }

  setOpenedPoly({
    fill: found.fill,
    points: found.points,
    name: found.name,
    id: found.id,
  });

  const newPolyHistory = findPolygonById(allPolys,editingPolyId)?.children;
  
  if (newPolyHistory) setPolygonHistory(newPolyHistory.map(poly=>({
    name:poly.name,
    points:poly.points,
    id:poly.id,
    fill:poly.fill
  })));
  else setPolygonHistory([]);
  if (!stageRef.current) return;
  setEditingPolyId("");
  //zoom:
  setBlockSize(blockSize*0.5)
  zoomToPolygon(stageRef.current, found.points)
  

}


  function saveOpenedPoly() {
    const updated=SaveToAllPolys()

    // Try to find the parent level
    const newPolyHistoryLevel = findParentAndSiblingsById(updated, openedPoly.id);
    if (newPolyHistoryLevel&&newPolyHistoryLevel.length>0) {
      // If function returns all items at that level
      setPolygonHistory(newPolyHistoryLevel.map(poly=>{
        return({
        name:poly.name,
        id:poly.id,
        points:poly.points,
        fill:poly.fill
        })
      }))
    }
    else {
      // Top-level fallback
      setPolygonHistory(allPolys.map(poly => ({
        id: poly.id,
        points: poly.points,
        name: poly.name,
        fill: poly.fill,
      })));
  }

  // Go back up one level
  const parent = findParentPolygonById(allPolys, openedPoly.id);
  if(parent){setOpenedPoly({
      fill: parent.fill,
      points: parent.points,
      name: parent.name,
      id: parent.id,
    });
    if(stageRef.current){setBlockSize(blockSize*2);zoomToPolygon(stageRef.current, parent.points);}
  }
  else{
    setOpenedPoly(emptyPolygon)
    if(stageRef.current){
      stageRef.current.scale({x:1,y:1})
      stageRef.current.position({x:0,y:0})
      setLineWidth(1)
      setBlockSize(blockSize*2)
      stageRef.current.batchDraw()
    }
  }
}

function SaveToAllPolys(){
  setActivePolygon(emptyPolygon)
  setEditingPolyId("")
  setIsDrawing(false)  
  if (openedPoly.id) {
    const updated = insertChildrenById(allPolys, openedPoly.id, polygonHistory, allPolys);  
    setAllPolys(updated);
    return updated
  } else {
    const newTopLevel = buildTopLayerWithPreservedChildren(polygonHistory, allPolys);
    setAllPolys(newTopLevel);
    return newTopLevel
  }
}

function zoomToPolygon(stage: Konva.Stage, points: number[]) {
  // Step 1: Get bounding box of the polygon
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const polygonWidth = maxX - minX;
  const polygonHeight = maxY - minY;

  // Step 2: Get canvas size
  const containerWidth = stage.width();
  const containerHeight = stage.height();

  // Step 3: Compute the scale that fits the polygon inside the stage
  const scaleX = containerWidth / polygonWidth;
  const scaleY = containerHeight / polygonHeight;
  const scale = Math.min(scaleX, scaleY) * 0.9; // leave 10% margin

  // Step 4: Centering: find offset to center the polygon
  const polygonCenterX = minX + polygonWidth / 2;
  const polygonCenterY = minY + polygonHeight / 2;

  const stageCenterX = containerWidth / 2;
  const stageCenterY = containerHeight / 2;

  const offsetX = stageCenterX - polygonCenterX * scale;
  const offsetY = stageCenterY - polygonCenterY * scale;

  // Step 5: Apply
  stage.position({ x: offsetX, y: offsetY });
  stage.scale({ x: scale, y: scale });
  setLineWidth(1/scale);

  stage.batchDraw(); // redraw for performance
}

  function findPolygonById(polygons: Polygon[], targetId: string): Polygon | null {
  for (const poly of polygons) {
    if (poly.id === targetId) return poly;
    if (poly.children && poly.children.length > 0) {
      const result = findPolygonById(poly.children, targetId);
      if (result) return result;
    }
  }
  return null;
}
function findParentPolygonById(polygons: Polygon[], childId: string): Polygon | null {
  for (const poly of polygons) {
    const children = poly.children ?? []; // ✅ safely default to empty array
    if (children.some(child => child.id === childId)) {
      return poly;
    }

    const foundInChildren = findParentPolygonById(children, childId);
    if (foundInChildren) return foundInChildren;
  }
  return null;
}
function insertChildrenById(
  polygons: Polygon[],
  targetId: string,
  childrenToInsert: SmallPolygon[],
  sourcePolygons: Polygon[] // full allPolys with nested children
): Polygon[] {
  const findFullPolygonById = (id: string, polys: Polygon[]): Polygon | null => {
    for (const poly of polys) {
      if (poly.id === id) return poly;
      const found = findFullPolygonById(id, poly.children || []);
      if (found) return found;
    }
    return null;
  };

  return polygons.map(poly => {
    if (poly.id === targetId) {
      // Otherwise, insert the new children (with preserved children if found)
      return {
        ...poly,
        children: childrenToInsert.map(child => {
          const full = findFullPolygonById(child.id, sourcePolygons);
          return {
            ...child,
            children: full?.children ?? [],
          };
        }),
      };
    }
    return {
      ...poly,
      children: insertChildrenById(poly.children ?? [], targetId, childrenToInsert, sourcePolygons),
    };
  });
}
function buildTopLayerWithPreservedChildren(
  newPolygons: SmallPolygon[],
  allPolys: Polygon[]
): Polygon[] {
  return newPolygons.map(poly => {
    const saved = findPolygonById(allPolys, poly.id);
    return {
      ...poly,
      children: saved?.children ?? [],
    };
  });
}
function findParentAndSiblingsById(polygons: Polygon[], targetId: string): Polygon[] | null {
  for (const poly of polygons) {
    if (poly.children?.some(child => child.id === targetId)) {
      return poly.children;
    }

    const deeper = findParentAndSiblingsById(poly.children || [], targetId);
    if (deeper) return deeper;
  }

  // Check if it's top-level
  if (polygons.some(poly => poly.id === targetId)) {
    return polygons;
  }

  return null;
}
function getDepthOfPolygon(polygons: Polygon[], targetId: string, currentDepth = 0): number {
  for (const poly of polygons) {
    if (poly.id === targetId) {
      return currentDepth;
    }
    if (poly.children && poly.children.length > 0) {
      const depthInChildren = getDepthOfPolygon(poly.children, targetId, currentDepth + 1);
      if (depthInChildren !== -1) return depthInChildren;
    }
  }
  return -1; // not found
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
    else if (e.key === "Enter") {
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
  let library=""
  if(openedPoly.id){
    const depth=getDepthOfPolygon(allPolys,openedPoly.id)
    let lastId=openedPoly.id
    for(let i=0;i<depth;i++){
      const adder=findParentPolygonById(allPolys,lastId)
      if(adder){library=adder?.name+" / "+library}
      lastId=adder!.id
    }
    library=library+openedPoly.name
  }
  library="Top Level / "+library
  return (
    <>
      <button onClick={()=>{SaveToAllPolys();switchMode()}} style={{marginRight:"0", float:"right"}}>View</button>
      <div style={{ margin: "10px"}}>
        <label htmlFor="color" style={{color:selectedColor}}>Choose color: </label>
        <input
          id="color"
          type="color"
          value={selectedColor}
          onChange={(e) => {setActivePolygon({...activePolygon, fill:e.target.value}); setSelectedColor(e.target.value)}}
        />
        {/* <button onClick={resetAll} style={{margin:10}}>reset</button> */}
        {openedPoly.id&&(
          <button onClick={saveOpenedPoly} style={{margin:10}}>Save and go back</button>
        )}
        <p style={{color:"black", display:"inline", borderRadius:"5px", fontSize:"20px", margin:"auto", padding:"5px", fontStyle:"italic", alignItems:"center"}}>{library}</p>
      </div>
      <div style={{clear: "both"}}></div>​
      {editingPolyId&&(
            <div className='editButtonDiv'  style={{left:editButtonPosition[0], top:editButtonPosition[1]}} onMouseMove={(e)=>setMousePos([e.clientX, e.clientY])}>
            <div className="editButtons">
            <label className="" style={{color:"white", margin:"5px"}}>Name</label>
             <AutoSelectInput
              changeName={changeName}
              polyName={polyName}/>
             <p style={{padding:"0", margin:"4px", backgroundColor:"transparent", display:"inline", color:"white", cursor:"pointer"}} onClick={()=>setEditingPolyId("")}>✓</p>
            </div>
            <button className='editButtons' onClick={clickOpen} style={{border:"2px solid rgb(43, 255, 0)"}}>open</button>
            <button className='editButtons' onClick={clickDelete}>delete</button>
            <button className='editButtons' onClick={clickEdit}>edit</button>
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
          <InfiniteGrid
            blockSize={blockSize}
            lineWidth={lineWidth}
            stageScale={stageRef.current?.scaleX() ?? 1}
            stageX={stageRef.current?.x() ?? 0}
            stageY={stageRef.current?.y() ?? 0}
          />        
        </Layer>
        <Layer>
          <PolygonHistory polygonHistory={polygonHistory} rightClickedPoly={rightClickedPoly} lineWidth={lineWidth}/>   
          {openedPoly.id&&
          (
            <><Line
              {...openedPoly}
              stroke={"red"}
              closed
              fill={"transparent"}
              listening={false}
              strokeWidth={lineWidth}
            />
            <Shape
              sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                // Draw full screen rectangle
                ctx.rect(0, 0, stageRef.current!.width(), stageRef.current!.height());

                // Create the hole using your points
                ctx.moveTo(openedPoly.points[0], openedPoly.points[1]);
                for (let i = 2; i < openedPoly.points.length; i += 2) {
                  ctx.lineTo(openedPoly.points[i], openedPoly.points[i + 1]);
                }
                ctx.closePath();

                ctx.fill('evenodd'); // Inverts the polygon!
                ctx.fillStrokeShape(shape);
              }}
              fill="rgba(97, 97, 97, 0.5)"
            />
          </>
          )}
          {isDrawing && (
            <><Line
            {...activePolygon}
            stroke={"green"}
            points={activePolygon.points.slice(0,-2)}
            strokeWidth={lineWidth*2}
            />
            <Line
            {...activePolygon}
            stroke={lineIsCorrect()?"green":"red"}
            points={activePolygon.points.slice(-4,activePolygon.points.length)}
            strokeWidth={lineWidth*2}
            />
            {isDrawing&&
            <Circle
              fill={"green"}
              x={activePolygon.points[0]}
              y={activePolygon.points[1]}
              radius={lineWidth*4}
            />
            }
            </>
          )}
          {stageRef.current?.getPointerPosition()&& !editingPolyId&&(
            <Circle
              fill={"black"}
              x={SnapCircle.x}
              y={SnapCircle.y}
              radius={lineWidth*4}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </>
  );
}

function AutoSelectInput({changeName, polyName}: { changeName: (e:React.ChangeEvent<HTMLInputElement>)=>void, polyName:string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <input
    style={{margin:"auto"}}
      ref={inputRef}
      onChange={changeName}
     className='' 
     type="text" 
     value={polyName}
    />
  );
}

type Props = {
  blockSize: number;
  lineWidth: number;
  stageScale: number;
  stageX: number;
  stageY: number;
};

function InfiniteGrid({ blockSize, lineWidth, stageScale, stageX, stageY }: Props) {
  const lines = [];

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Convert screen dimensions to canvas (world) coordinates
  const startX = -stageX / stageScale;
  const startY = -stageY / stageScale;
  const endX = startX + screenWidth / stageScale;
  const endY = startY + screenHeight / stageScale;

  const firstGridX = Math.floor(startX / blockSize) * blockSize;
  const firstGridY = Math.floor(startY / blockSize) * blockSize;

  for (let x = firstGridX; x < endX; x += blockSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke="rgb(88, 88, 88)"
        strokeWidth={lineWidth}
        listening={false}
      />
    );
  }

  for (let y = firstGridY; y < endY; y += blockSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke="rgb(88, 88, 88)"
        strokeWidth={lineWidth}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}

function PolygonHistory({
  polygonHistory,
  rightClickedPoly,
  lineWidth
}: {
  polygonHistory: { points: number[]; fill: string; name: string }[];
  rightClickedPoly: (evt: KonvaEventObject<MouseEvent>) => void;
  lineWidth:number
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
          strokeWidth={lineWidth}
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
          fontSize={lineWidth*20}
          fill="white"
          listening={false}
          name={rect.name}
          onContextMenu={(e)=>e.evt.preventDefault()}
        />
      </React.Fragment>
    );
  });
}


export default PaintApp;
