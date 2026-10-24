# Recursive Polygon Engine

A React and TypeScript-based recursive drawing application. This project is a demonstration of computational geometry and nested data structures built from scratch, rendering complex polygonal relationships via `react-konva`.

## Engineering Highlights

* **Computational Geometry:** Implements custom ray-casting algorithms for precise point-in-polygon detection and utilizes cross-product mathematics for line intersection and collision checks.
* **Recursive Data Structures:** Manages a hierarchical N-ary tree state (`children: Polygon[]`) to support deeply nested drawing environments and local-to-global coordinate transformations.
* **State & Rendering:** Efficient state mutation and viewport scaling (bounding box algorithms) for complex hierarchical polygon graphs without relying on external physics engines.

## Tech Stack

* React & TypeScript
* Vite
* React-Konva (Canvas API)
