import type { GeneralGraph, ColorScheme, LabyrinthControls } from '../types';
interface Props {
    graph: GeneralGraph;
    startNode?: string;
    goalNodes?: string[];
    nodeRadius?: number;
    autoPlay?: boolean;
    animationSpeed?: number;
    colors?: ColorScheme;
    showMultiGoal?: boolean;
    showNodeIds?: boolean;
    onControls?: (controls: LabyrinthControls) => void;
}
declare const GraphVisualizer: import("svelte").Component<Props, {}, "">;
type GraphVisualizer = ReturnType<typeof GraphVisualizer>;
export default GraphVisualizer;
