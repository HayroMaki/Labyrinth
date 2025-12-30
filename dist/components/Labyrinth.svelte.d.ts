import type { Graph, AlgorithmType } from '../types';
import type { ColorScheme } from '../types';
interface Props {
    graph: Graph;
    cellSize?: number;
    wallThickness?: number;
    algorithm?: AlgorithmType;
    startNode?: string;
    endNode?: string;
    autoPlay?: boolean;
    legend?: boolean;
    stepCount?: boolean;
    animationSpeed?: number;
    showGrid?: boolean;
    colors?: ColorScheme;
}
declare const Labyrinth: import("svelte").Component<Props, {}, "">;
type Labyrinth = ReturnType<typeof Labyrinth>;
export default Labyrinth;
