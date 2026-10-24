import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Text} from 'react-konva';
import type Konva from 'konva';
import React from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
type Polygon = {
  points: number[];
  fill: string;
  name: string;
  id: string;
  children: Polygon[]; // same structure recursively
};
const scaleBy=1.01
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

function ZoomApp({ allPolys }: { allPolys: Polygon[] }){
  const stageRef = useRef<Konva.Stage | null>(null);
  const [scrollSize, setScrollSize]=useState(1)
  const blockSize=25
  const [lineWidth, setLineWidth]=useState(1)

  function handleWheel(e:KonvaEventObject<WheelEvent>){
    e.evt.preventDefault()
    const stage = stageRef.current!;
    const oldScale = stage.scaleX();
    const pointer= stage.getPointerPosition()!;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? -1 : 1;
    const maxScale=50
    const minScale=1

    const newScale = Math.min(Math.max(direction > 0 ? oldScale * scaleBy : oldScale / scaleBy, minScale), maxScale);

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    setScrollSize(newScale)
  };
  function handleDragMove(e:KonvaEventObject<DragEvent>){

    if(e.target.position().x>0){
      const x=0
      const y=e.target.position().y
      e.target.position({ x, y });
    }
    if(e.target.position().y>0){
      const x=e.target.position().x
      const y=0
      e.target.position({ x, y });
    }
  }


  return(
    <Stage 
    width={1400}
    height={700}
    ref={stageRef} 
    onWheel={handleWheel} 
    draggable
    onDragMove={handleDragMove}
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
      <Layer >
        <Polygons scrollSize={scrollSize} allPolys={allPolys}/>
      </Layer>
    </Stage>
  )


}

function Polygons({scrollSize, allPolys}:{scrollSize:number, allPolys:Polygon[]}){
  function getPolygonsOrParentsAtLevel(
  polys: Polygon[],
  targetLevel: number,
  currentLevel = 1,
  parent: Polygon | null = null
): Polygon[] {
  if (currentLevel === targetLevel) {
    return polys.length === 0 && parent ? [parent] : polys;
  }
  if (currentLevel > targetLevel) return [];

  return polys.flatMap(poly =>
    getPolygonsOrParentsAtLevel(poly.children ?? [], targetLevel, currentLevel + 1, poly)
  );
}

  
  const textRefs = useRef<Konva.Text[]>([]);
    const [textSizes, setTextSizes] = useState<{ width: number; height: number }[]>(
      []
    );
  useEffect(() => {
      const newSizes = textRefs.current.map((ref) =>
        ref ? { width: ref.width(), height: ref.height() } : { width: 0, height: 0 }
      );
      setTextSizes(newSizes);
    }, [allPolys]);
  
  const zoomLevel=Math.round(Math.log(scrollSize)/Math.log(scaleBy)/30)
  console.log(zoomLevel);
  
  let displayPolys;
  if(zoomLevel<1){
    displayPolys=allPolys.map((poly)=>({id:poly.id, name:poly.name,points:poly.points, fill:poly.fill}))
  }
  else{
    displayPolys=getPolygonsOrParentsAtLevel(allPolys, zoomLevel)
  }

  
  return(
  displayPolys.map((poly,i)=>{
    const center = getPolygonCenter(poly.points);
    return(
    <><Line
      key={poly.id+"-line"}
      points={poly.points}
      id={poly.id}
      fill={poly.fill}
      closed
      stroke={"red"}
      strokeWidth={1/scrollSize}
    />
    <Text
      key={poly.id+"-text"}
      ref={(el) => {
        if (el) textRefs.current[i] = el;
      }}
      x={center.x}
      y={center.y}
      offsetX={(textSizes[i]?.width ?? 0) / 2}
      offsetY={(textSizes[i]?.height ?? 0) / 2}
      text={poly.name}
      fontSize={(1/scrollSize)*20}
      fill="white"
      listening={false}
      name={poly.name}
      onContextMenu={(e)=>e.evt.preventDefault()}
    />
    </>
  );
  }))
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

export default ZoomApp