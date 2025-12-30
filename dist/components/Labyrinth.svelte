<script lang="ts">
	import type { Graph, AlgorithmType, PathStep, LabyrinthControls } from '../types';
	import { dijkstra } from '../algorithms/dijkstra';
	import { astar } from '../algorithms/astar';

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
		onControls?: (controls: LabyrinthControls) => void;
	}

	let {
		graph,
		cellSize = 30,
		wallThickness = 2,
		algorithm = 'astar',
		startNode = '0,0',
		endNode,
		autoPlay = false,
		legend = true,
		stepCount = true,
		animationSpeed = 50,
		showGrid = true,
		colors,
		onControls
	}: Props = $props();
	const defaultColors: Required<ColorScheme> = {
		start: '#22c55e',
		end: '#ef4444',
		current: '#f59e0b',
		visiting: '#fef3c7',
		visited: '#e5e7eb',
		path: '#3b82f6',
		background: '#ffffff',
		wall: '#1f2937',
		grid: '#e5e7eb',
		legend: '#f9fafb',
		legendtext: '#1f2937',
		buttons: '#3b82f6',
		buttonshover: '#2563eb',
		buttonsdisabled: '#9ca3af',
		buttonstext: '#ffffff'
	};

	const colorScheme = $derived({ ...defaultColors, ...colors });
	const computedEndNode = $derived(endNode ?? `${graph.width - 1},${graph.height - 1}`);
	const cssVars = $derived(
		`--lab-buttons:${colorScheme.buttons};
		--lab-buttonstext:${colorScheme.buttonstext};
		--lab-buttonshover:${colorScheme.buttonshover};
		--lab-buttonsdisabled:${colorScheme.buttonsdisabled};
		--lab-legend:${colorScheme.legend};
		--lab-legend-text:${colorScheme.legendtext};`
	);

	let currentStepIndex = $state(0);
	let isPlaying = $state(false);
	let steps: PathStep[] = $state([]);
	let intervalId: number | null = null;

	const visitedNodes = $derived(new Set(
		steps.slice(0, currentStepIndex).filter(s => s.type === 'visited').map(s => s.nodeId)
	));
	
	const visitingNodes = $derived(new Set(
		steps.slice(0, currentStepIndex).filter(s => s.type === 'visiting').map(s => s.nodeId)
	));
	
	const currentNode = $derived(
		steps[currentStepIndex - 1]?.type === 'current' ? steps[currentStepIndex - 1]?.nodeId : null
	);
	
	const pathNodes = $derived(new Set(
		steps.slice(0, currentStepIndex).filter(s => s.type === 'path').map(s => s.nodeId)
	));

	function runAlgorithm() {
		const result = algorithm === 'dijkstra' 
			? dijkstra(graph, startNode, computedEndNode)
			: astar(graph, startNode, computedEndNode);
		
		steps = result.steps;
		currentStepIndex = 0;
	}

	$effect(() => {
		algorithm;
		reset();
	});

	function play() {
		if (steps.length === 0) {
			runAlgorithm();
		}
		
		isPlaying = true;
		intervalId = window.setInterval(() => {
			if (currentStepIndex < steps.length) {
				currentStepIndex++;
			} else {
				pause();
			}
		}, animationSpeed);
	}

	function pause() {
		isPlaying = false;
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function reset() {
		pause();
		currentStepIndex = 0;
		steps = [];
	}

	function stepForward() {
		if (steps.length === 0) {
			runAlgorithm();
		}
		if (currentStepIndex < steps.length) {
			currentStepIndex++;
		}
	}

	function stepBackward() {
		if (currentStepIndex > 0) {
			currentStepIndex--;
		}
	}

	function getCellColor(nodeId: string): string {
		if (nodeId === startNode) return colorScheme.start;
		if (nodeId === computedEndNode) return colorScheme.end;
		if (pathNodes.has(nodeId)) return colorScheme.path;
		if (nodeId === currentNode) return colorScheme.current;
		if (visitedNodes.has(nodeId)) return colorScheme.visited;
		if (visitingNodes.has(nodeId)) return colorScheme.visiting;
		return colorScheme.background;
	}

	function getWalls(nodeId: string): { top: boolean; right: boolean; bottom: boolean; left: boolean } {
		const node = graph.nodes.get(nodeId);
		if (!node) return { top: true, right: true, bottom: true, left: true };

		const { x, y } = node;
		const hasTop = !node.neighbors.includes(`${x},${y - 1}`);
		const hasRight = !node.neighbors.includes(`${x + 1},${y}`);
		const hasBottom = !node.neighbors.includes(`${x},${y + 1}`);
		const hasLeft = !node.neighbors.includes(`${x - 1},${y}`);

		return { top: hasTop, right: hasRight, bottom: hasBottom, left: hasLeft };
	}

	$effect(() => {
		if (autoPlay && steps.length === 0) {
			play();
		}
	});

	$effect(() => {
		return () => {
			if (intervalId !== null) {
				clearInterval(intervalId);
			}
		};
	});

	const width = $derived(graph.width * cellSize);
	const height = $derived(graph.height * cellSize);

	const controlApi: LabyrinthControls = {
		play,
		pause,
		reset,
		stepForward,
		stepBackward
	};

	$effect(() => {
		onControls?.(controlApi);
	});
</script>

<div class="labyrinth-container" style={cssVars}>
	<svg 
		{width} 
		{height}
		class="labyrinth-svg"
		style="border: {wallThickness}px solid {colorScheme.wall};"
	>
		{#each Array.from(graph.nodes.values()) as node}
			{@const walls = getWalls(node.id)}
			{@const x = node.x * cellSize}
			{@const y = node.y * cellSize}
			{@const color = getCellColor(node.id)}
			
			<rect
				{x}
				{y}
				width={cellSize}
				height={cellSize}
				fill={color}
				stroke={showGrid ? colorScheme.grid : 'none'}
				stroke-width="0.5"
			/>
			
			{#if walls.top}
				<line
					x1={x}
					y1={y}
					x2={x + cellSize}
					y2={y}
					stroke={colorScheme.wall}
					stroke-width={wallThickness}
				/>
			{/if}
			
			{#if walls.right}
				<line
					x1={x + cellSize}
					y1={y}
					x2={x + cellSize}
					y2={y + cellSize}
					stroke={colorScheme.wall}
					stroke-width={wallThickness}
				/>
			{/if}
			
			{#if walls.bottom}
				<line
					x1={x}
					y1={y + cellSize}
					x2={x + cellSize}
					y2={y + cellSize}
					stroke={colorScheme.wall}
					stroke-width={wallThickness}
				/>
			{/if}
			
			{#if walls.left}
				<line
					x1={x}
					y1={y}
					x2={x}
					y2={y + cellSize}
					stroke={colorScheme.wall}
					stroke-width={wallThickness}
				/>
			{/if}
		{/each}
	</svg>

	<div class="controls">
		<button onclick={play} disabled={isPlaying}>Play</button>
		<button onclick={pause} disabled={!isPlaying}>Pause</button>
		<button onclick={reset}>Reset</button>
		<button onclick={stepBackward} disabled={isPlaying || currentStepIndex === 0}>Step Back</button>
		<button onclick={stepForward} disabled={isPlaying || currentStepIndex === steps.length}>Step Forward</button>
		{#if stepCount}
			<span class="step-counter">
				Step: {currentStepIndex} / {steps.length}
			</span>
		{/if}
	</div>

	{#if legend}
		<div class="legend">
			<div class="legend-item">
				<div class="legend-color" style="background-color: {colorScheme.start};"></div>
				<span>Start</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: {colorScheme.end};"></div>
				<span>End</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: {colorScheme.current};"></div>
				<span>Current</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: {colorScheme.visiting};"></div>
				<span>Visiting</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: {colorScheme.visited};"></div>
				<span>Visited</span>
			</div>
			<div class="legend-item">
				<div class="legend-color" style="background-color: {colorScheme.path};"></div>
				<span>Path</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.labyrinth-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		padding: 1rem;
	}

	.labyrinth-svg {
		background-color: white;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
	}

	.controls {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.controls button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
		background-color: var(--lab-buttons);
		color: var(--lab-buttonstext);
	}

	.controls button:hover:not(:disabled) {
		background-color: var(--lab-buttonshover);
	}

	.controls button:disabled {
		background-color: var(--lab-buttonsdisabled);
		cursor: not-allowed;
	}

	.step-counter {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		background-color: var(--lab-legend);
		color: var(--lab-legend-text);
	}

	.legend {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		padding: 0.75rem;
		border-radius: 0.5rem;
		background-color: var(--lab-legend);
		color: var(--lab-legend-text);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-color {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: 1px solid var(--lab-legend-text);
	}
</style>
