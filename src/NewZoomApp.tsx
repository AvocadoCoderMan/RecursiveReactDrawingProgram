import React, { useState } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";

const TILE_COLORS = ["#d0f0c0", "#add8e6", "#ffe4e1", "#f9f9a9"];

const zoomLevels = {
  0: [
    { x: 0, y: 0, width: 600, height: 400, label: "Apartment" },
  ],
  1: [
    { x: 0, y: 0, width: 300, height: 400, label: "Schlafzimmer" },
    { x: 300, y: 0, width: 150, height: 400, label: "Badezimmer" },
    { x: 450, y: 0, width: 150, height: 400, label: "Wohnzimmer" },
  ],
  2: [
    { x: 20, y: 20, width: 100, height: 60, label: "Bett" },
    { x: 130, y: 20, width: 60, height: 60, label: "Schrank" },
    { x: 460, y: 30, width: 80, height: 50, label: "TV" },
    { x: 460, y: 90, width: 120, height: 80, label: "Sofa" },
  ]
};

const MAX_ZOOM = 2;

export default function ApartmentMap() {
  const [zoom, setZoom] = useState(0);

  const handleZoomIn = () => {
    if (zoom < MAX_ZOOM) setZoom(zoom + 1);
  };

  const handleZoomOut = () => {
    if (zoom > 0) setZoom(zoom - 1);
  };

  const tiles = zoomLevels[zoom] || [];

  return (
    <div style={{ padding: 20 }}>
      <h2>Apartmentskizze – Zoom-Level {zoom}</h2>
      <button onClick={handleZoomOut} disabled={zoom === 0}>
        -
      </button>
      <button onClick={handleZoomIn} disabled={zoom === MAX_ZOOM} style={{ marginLeft: 10 }}>
        +
      </button>

      <Stage width={800} height={500} style={{ marginTop: 20 }}>
        <Layer>
          {tiles.map((tile, index) => (
            <React.Fragment key={index}>
              <Rect
                x={tile.x}
                y={tile.y}
                width={tile.width}
                height={tile.height}
                stroke="black"
                fill={TILE_COLORS[index % TILE_COLORS.length]}
              />
              <Text
                x={tile.x + 10}
                y={tile.y + 10}
                text={tile.label}
                fontSize={16}
                fill="#333"
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
    