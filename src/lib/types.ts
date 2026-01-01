export interface Point {
	x: number;
	y: number;
}

export interface Cell {
	x: number;
	y: number;
	walls: {
		top: boolean;
		right: boolean;
		bottom: boolean;
		left: boolean;
	};
	visited: boolean;
}

export interface GraphNode {
	id: string;
	x: number;
	y: number;
	neighbors: string[];
}

export interface Graph {
	nodes: Map<string, GraphNode>;
	width: number;
	height: number;
}

export interface PathStep {
	nodeId: string;
	type: 'visiting' | 'visited' | 'path' | 'current';
	distance?: number;
	heuristic?: number;
	fScore?: number;
}

export interface AlgorithmResult {
	path: string[];
	steps: PathStep[];
	found: boolean;
}

export type AlgorithmType = 'dijkstra' | 'astar';

export interface ColorScheme {
	start?: string;
	end?: string;
	current?: string;
	visiting?: string;
	visited?: string;
	path?: string;
	background?: string;
	wall?: string;
	grid?: string;
    legend?: string;
    legendtext?: string;
    buttons?: string;
    buttonshover?: string;
    buttonsdisabled?: string;
    buttonstext?: string;
}

export interface LabyrinthControls {
	play: () => void;
	pause: () => void;
	reset: () => void;
	stepForward: () => void;
	stepBackward: () => void;
}

export interface GeneralGraphNode {
	id: string;
	x: number;
	y: number;
	neighbors: string[];
}

export interface GeneralGraph {
	nodes: Map<string, GeneralGraphNode>;
}

export interface BFSStep {
	nodeId: string;
	type: 'start-forward' | 'start-backward' | 'goal-forward' | 'goal-backward' | 'visited-forward' | 'visited-backward' | 'path' | 'current-forward' | 'current-backward' | 'intersection';
	side?: 'forward' | 'backward';
	level?: number;
}

export interface BFSResult {
	path: string[];
	steps: BFSStep[];
	found: boolean;
	intersectionNode?: string;
}

export interface MultiGoalResult {
	goals: string[];
	paths: Map<string, string[]>;
	optimalTour: string[];
	steps: BFSStep[];
}
