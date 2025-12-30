# Labyrinth

A Svelte package for visualizing graph pathfinding algorithms with interactive maze generation and solving.

## Features

- 🎯 **Algorithm Visualization**: Step-by-step visualization of Dijkstra's and A* pathfinding algorithms
- 🌀 **Maze Generation**: Generates perfect mazes using Recursive Backtracking algorithm
- 🎨 **Interactive Component**: Fully customizable Svelte component with play/pause controls
- 📊 **Graph-based**: Uses proper graph data structures for efficient pathfinding
- 🔧 **TypeScript**: Fully typed for excellent developer experience
- ⚡ **Configurable**: Adjustable maze size, cell size, and animation speed

## Installation

```bash
npm install labyrinth
```

## Usage

### Basic Example

```svelte
<script>
  import { generateLabyrinth, Labyrinth } from 'labyrinth';
  
  const graph = generateLabyrinth(20, 20);
</script>

<Labyrinth {graph} algorithm="astar" />
```

### Advanced Example

```svelte
<script>
  import { generateLabyrinth, Labyrinth } from 'labyrinth';
  import type { Graph, AlgorithmType, ColorScheme } from 'labyrinth';
  
  let width = 25;
  let height = 25;
  let algorithm: AlgorithmType = 'dijkstra';
  
  const graph = generateLabyrinth(width, height);
  
  const customColors: ColorScheme = {
    start: '#10b981',
    end: '#dc2626',
    path: '#8b5cf6',
    wall: '#374151'
  };
</script>

<Labyrinth
  {graph}
  {algorithm}
  cellSize={30}
  animationSpeed={50}
  autoPlay={false}
  showGrid={true}
  colors={customColors}
/>
```

## API Reference

### `generateLabyrinth(width: number, height: number): Graph`

Generates a perfect maze (exactly one path between any two points) using the Recursive Backtracking algorithm.

**Parameters:**
- `width`: Number of cells horizontally
- `height`: Number of cells vertically

**Returns:** A `Graph` object representing the maze

### `Labyrinth` Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `graph` | `Graph` | **required** | The maze graph to visualize |
| `algorithm` | `'dijkstra' \| 'astar'` | `'astar'` | Pathfinding algorithm to use |
| `cellSize` | `number` | `30` | Size of each cell in pixels |
| `wallThickness` | `number` | `2` | Thickness of walls in pixels |
| `startNode` | `string` | `'0,0'` | Starting node ID (format: "x,y") |
| `endNode` | `string` | `'{width-1},{height-1}'` | Ending node ID (format: "x,y"), auto-computed from graph size |
| `autoPlay` | `boolean` | `false` | Start animation automatically |
| `animationSpeed` | `number` | `50` | Delay between steps in milliseconds |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `colors` | `ColorScheme` | default theme | Custom color scheme (see below) |

### Algorithms

#### Dijkstra's Algorithm
- Explores all nodes systematically
- Guarantees shortest path
- Works well for unweighted graphs
- Time complexity: O((V+E) log V)

#### A* Algorithm
- Uses Manhattan distance heuristic
- More efficient than Dijkstra for pathfinding
- Explores fewer nodes by prioritizing promising paths
- Guarantees shortest path with admissible heuristic

### Functions

```typescript
// Generate a maze
import { generateLabyrinth } from 'labyrinth';
const graph = generateLabyrinth(20, 20);

// Run algorithms programmatically
import { dijkstra, astar } from 'labyrinth';
const result = dijkstra(graph, '0,0', '19,19');
const result2 = astar(graph, '0,0', '19,19');
```

### Color Customization

You can customize all colors used in the visualization by passing a `colors` object:

```typescript
import type { ColorScheme } from 'labyrinth';

const customColors: ColorScheme = {
  start: '#10b981',      // Start node color
  end: '#dc2626',        // End node color
  current: '#f59e0b',    // Current node being explored
  visiting: '#fef3c7',   // Nodes in the frontier
  visited: '#e5e7eb',    // Already visited nodes
  path: '#8b5cf6',       // Final path color
  background: '#ffffff', // Cell background
  wall: '#374151',       // Wall color
  grid: '#e5e7eb'        // Grid line color
};
```

All color properties are optional - only specify the ones you want to override.

### Types

```typescript
interface Graph {
  nodes: Map<string, GraphNode>;
  width: number;
  height: number;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  neighbors: string[];
}

interface AlgorithmResult {
  path: string[];
  steps: PathStep[];
  found: boolean;
}

interface PathStep {
  nodeId: string;
  type: 'visiting' | 'visited' | 'path' | 'current';
  distance?: number;
  heuristic?: number;
  fScore?: number;
}

interface ColorScheme {
  start?: string;
  end?: string;
  current?: string;
  visiting?: string;
  visited?: string;
  path?: string;
  background?: string;
  wall?: string;
  grid?: string;
}
```

## Development

```bash
# Install dependencies
npm install

# Start dev server with demo
npm run dev

# Build the package
npm run package

# Type check
npm run check
```

## How It Works

### Maze Generation
The package uses **Recursive Backtracking** (a DFS-based algorithm) to generate perfect mazes:
1. Start at a random cell and mark it as visited
2. While there are unvisited neighbors:
   - Choose a random unvisited neighbor
   - Remove the wall between current cell and chosen neighbor
   - Recursively visit the neighbor
3. Backtrack when stuck

This guarantees a maze with exactly one path between any two points.

### Pathfinding Visualization
The component visualizes the algorithm's execution step-by-step:
- **Green**: Start node
- **Red**: End node
- **Orange**: Current node being explored
- **Yellow**: Nodes in the frontier (being considered)
- **Gray**: Visited nodes
- **Blue**: Final shortest path

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
