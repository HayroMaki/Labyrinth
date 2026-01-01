<script lang="ts">
	import type { GeneralGraph, BFSStep, ColorScheme, LabyrinthControls } from '../types';
	import { bidirectionalBFS, findOptimalMultiGoalPath } from '../algorithms/bidirectional-bfs';

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

	let {
		graph,
		startNode,
		goalNodes = [],
		nodeRadius = 20,
		autoPlay = false,
		animationSpeed = 100,
		colors,
		showMultiGoal = false,
		showNodeIds = true,
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
	
	const nodeIds = $derived(Array.from(graph.nodes.keys()));
	const computedStartNode = $derived(startNode ?? nodeIds[0]);
	const computedGoalNodes = $derived(
		goalNodes.length > 0 ? goalNodes : [nodeIds[Math.floor(nodeIds.length / 2)]]
	);

	const cssVars = $derived(
		`--graph-buttons:${colorScheme.buttons};
		--graph-buttonstext:${colorScheme.buttonstext};
		--graph-buttonshover:${colorScheme.buttonshover};
		--graph-buttonsdisabled:${colorScheme.buttonsdisabled};
		--graph-legend:${colorScheme.legend};
		--graph-legend-text:${colorScheme.legendtext};`
	);

	let currentStepIndex = $state(0);
	let isPlaying = $state(false);
	let steps: BFSStep[] = $state([]);
	let intervalId: number | null = null;
	let optimalPath: string[] = $state([]);

	const forwardVisitedNodes = $derived(
		new Set(
			steps
				.slice(0, currentStepIndex)
				.filter((s) => s.type === 'visited-forward')
				.map((s) => s.nodeId)
		)
	);

	const backwardVisitedNodes = $derived(
		new Set(
			steps
				.slice(0, currentStepIndex)
				.filter((s) => s.type === 'visited-backward')
				.map((s) => s.nodeId)
		)
	);

	const forwardFrontier = $derived(
		new Set(
			steps
				.slice(0, currentStepIndex)
				.filter((s) => s.type === 'goal-forward')
				.map((s) => s.nodeId)
		)
	);

	const backwardFrontier = $derived(
		new Set(
			steps
				.slice(0, currentStepIndex)
				.filter((s) => s.type === 'goal-backward')
				.map((s) => s.nodeId)
		)
	);

	const currentForwardNode = $derived(
		steps[currentStepIndex - 1]?.type === 'current-forward'
			? steps[currentStepIndex - 1]?.nodeId
			: null
	);

	const currentBackwardNode = $derived(
		steps[currentStepIndex - 1]?.type === 'current-backward'
			? steps[currentStepIndex - 1]?.nodeId
			: null
	);

	const intersectionNode = $derived(
		steps.slice(0, currentStepIndex).find((s) => s.type === 'intersection')?.nodeId
	);

	const pathNodes = $derived(
		new Set(steps.slice(0, currentStepIndex).filter((s) => s.type === 'path').map((s) => s.nodeId))
	);

	const permutationTestNodes = $derived(
		new Set(
			steps
				.slice(0, currentStepIndex)
				.filter((s) => s.type === 'permutation-test')
				.map((s) => s.nodeId)
		)
	);

	const permutationBestNodes = $derived(
		new Set(
			steps
				.slice(0, currentStepIndex)
				.filter((s) => s.type === 'permutation-best')
				.map((s) => s.nodeId)
		)
	);

	const currentPermutationInfo = $derived(() => {
		const currentStep = steps[currentStepIndex - 1];
		if (currentStep?.type === 'permutation-test' || currentStep?.type === 'permutation-best') {
			return {
				index: currentStep.permutationIndex ?? 0,
				length: currentStep.permutationLength ?? 0,
				isBest: currentStep.isBest ?? false
			};
		}
		return null;
	});

	function runAlgorithm() {
		if (showMultiGoal && computedGoalNodes.length > 1) {
			const result = findOptimalMultiGoalPath(graph, computedStartNode, computedGoalNodes);
			optimalPath = result.optimalPath;
			
			// First show BFS exploration for each pair
			steps = [];
			const tour = [computedStartNode, ...computedGoalNodes];
			
			for (let i = 0; i < tour.length - 1; i++) {
				const segmentResult = bidirectionalBFS(graph, tour[i], tour[i + 1]);
				steps.push(...segmentResult.steps);
			}
			
			// Add a "clear" step to reset colors before permutation testing
			steps.push({
				nodeId: '',
				type: 'path' // Dummy step to trigger color reset
			});
			
			// Then show permutation comparison phase
			steps.push(...result.permutationSteps);
		} else {
			const result = bidirectionalBFS(graph, computedStartNode, computedGoalNodes[0]);
			steps = result.steps;
			optimalPath = result.path;
		}
		currentStepIndex = 0;
	}

	$effect(() => {
		computedStartNode;
		computedGoalNodes;
		reset();
	});

	function play() {
		if (steps.length === 0) {
			runAlgorithm();
		}

		// Clear any existing interval to prevent accumulation
		if (intervalId !== null) {
			clearInterval(intervalId);
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
		optimalPath = [];
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

	function getNodeColor(nodeId: string): string {
		if (nodeId === computedStartNode) return colorScheme.start;
		if (computedGoalNodes.includes(nodeId)) return colorScheme.end;
		if (permutationBestNodes.has(nodeId)) return '#10b981'; // Green for best permutation
		if (permutationTestNodes.has(nodeId)) return '#fbbf24'; // Yellow for testing permutation
		if (pathNodes.has(nodeId)) return colorScheme.path;
		if (nodeId === intersectionNode) return '#a855f7';
		if (nodeId === currentForwardNode) return colorScheme.current;
		if (nodeId === currentBackwardNode) return '#f97316';
		if (forwardVisitedNodes.has(nodeId)) return colorScheme.visited;
		if (backwardVisitedNodes.has(nodeId)) return '#fecaca';
		if (forwardFrontier.has(nodeId)) return colorScheme.visiting;
		if (backwardFrontier.has(nodeId)) return '#fed7aa';
		return colorScheme.background;
	}

	function getNodeStroke(nodeId: string): string {
		if (nodeId === computedStartNode || computedGoalNodes.includes(nodeId)) {
			return colorScheme.wall;
		}
		if (pathNodes.has(nodeId)) return colorScheme.path;
		return colorScheme.grid;
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

	const svgWidth = $derived(
		Math.max(...Array.from(graph.nodes.values()).map(n => n.x)) + 100
	);
	const svgHeight = $derived(
		Math.max(...Array.from(graph.nodes.values()).map(n => n.y)) + 100
	);
</script>

<div class="graph-container" style={cssVars}>
	{#if currentPermutationInfo()}
		<div class="permutation-info">
			{#if currentPermutationInfo()?.isBest}
				<span class="font-mono text-sm font-bold" style="color: #10b981;">
					✓ Best permutation found! Length: {currentPermutationInfo()?.length}
				</span>
			{:else}
				<span class="font-mono text-sm">
					Testing permutation #{(currentPermutationInfo()?.index ?? 0) + 1} - Length: {currentPermutationInfo()?.length}
				</span>
			{/if}
		</div>
	{/if}
	<svg width={svgWidth} height={svgHeight}>
		<defs>
			<marker
				id="arrowhead"
				markerWidth="10"
				markerHeight="7"
				refX="9"
				refY="3.5"
				orient="auto"
			>
				<polygon points="0 0, 10 3.5, 0 7" fill={colorScheme.grid} />
			</marker>
		</defs>

		{#each Array.from(graph.nodes.values()) as node}
			{#each node.neighbors as neighborId}
				{@const neighbor = graph.nodes.get(neighborId)}
				{#if neighbor && node.id < neighborId}
					<line
						x1={node.x}
						y1={node.y}
						x2={neighbor.x}
						y2={neighbor.y}
						stroke={colorScheme.grid}
						stroke-width="2"
					/>
				{/if}
			{/each}
		{/each}

		{#each Array.from(graph.nodes.values()) as node}
			{@const color = getNodeColor(node.id)}
			{@const stroke = getNodeStroke(node.id)}
			<circle
				cx={node.x}
				cy={node.y}
				r={nodeRadius}
				fill={color}
				stroke={stroke}
				stroke-width="3"
			/>
			{#if showNodeIds}
				<text
					x={node.x}
					y={node.y}
					text-anchor="middle"
					dominant-baseline="middle"
					font-size="10"
					font-weight="600"
					fill={colorScheme.wall}
				>
					{node.id.replace('n', '')}
				</text>
			{/if}
		{/each}
	</svg>
</div>

<style>
	.graph-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.permutation-info {
		position: fixed;
		padding: 0.75rem 1.5rem;
		background-color: #f9fafb;
		border: 2px solid #1f2937;
		border-radius: 0.25rem;
		text-align: center;
	}
</style>
