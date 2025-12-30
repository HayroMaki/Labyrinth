<script lang="ts">
	import { generateLabyrinth, Labyrinth } from '$lib';
	import type { Graph, AlgorithmType } from '$lib';

	let width = $state(15);
	let height = $state(15);
	let algorithm: AlgorithmType = $state('astar');
	let cellSize = $state(30);
	let animationSpeed = $state(50);
	let seed = $state(0);

	let graph = $derived.by(() => {
		seed;
		return generateLabyrinth(width, height);
	});

	function regenerate() {
		seed++;
	}
</script>

<div class="container">
	<h1>Labyrinth Pathfinding Visualizer</h1>
	<p class="subtitle">
		Visualize Dijkstra's and A* algorithms solving randomly generated mazes
	</p>

	<div class="config-panel">
		<div class="config-group">
			<label for="width">Width: {width}</label>
			<input
				id="width"
				type="range"
				min="5"
				max="30"
				bind:value={width}
			/>
		</div>

		<div class="config-group">
			<label for="height">Height: {height}</label>
			<input
				id="height"
				type="range"
				min="5"
				max="30"
				bind:value={height}
			/>
		</div>

		<div class="config-group">
			<label for="cellSize">Cell Size: {cellSize}px</label>
			<input
				id="cellSize"
				type="range"
				min="15"
				max="50"
				bind:value={cellSize}
			/>
		</div>

		<div class="config-group">
			<label for="speed">Animation Speed: {animationSpeed}ms</label>
			<input
				id="speed"
				type="range"
				min="5"
				max="200"
				bind:value={animationSpeed}
			/>
		</div>

		<div class="config-group">
			<label for="algorithm">Algorithm:</label>
			<select id="algorithm" bind:value={algorithm}>
				<option value="astar">A* (Heuristic)</option>
				<option value="dijkstra">Dijkstra</option>
			</select>
		</div>

		<button class="regenerate-btn" onclick={regenerate}>
			Generate New Maze
		</button>
	</div>

	<Labyrinth
		{graph}
		{algorithm}
		{cellSize}
		{animationSpeed}
		showGrid={false}
		legend={true}
		stepCount={false}
	/>

	<div class="info-section">
		<h2>About</h2>
		<p>
			This demo showcases a Svelte package for visualizing graph pathfinding algorithms.
			The maze is generated using <strong>Recursive Backtracking</strong>, which creates
			a perfect maze (exactly one path between any two points).
		</p>
		
		<h3>Algorithms</h3>
		<ul>
			<li>
				<strong>Dijkstra's Algorithm:</strong> Explores all nodes systematically,
				guaranteeing the shortest path. Works well for unweighted graphs.
			</li>
			<li>
				<strong>A* Algorithm:</strong> Uses a heuristic (Manhattan distance) to guide
				the search toward the goal, making it more efficient than Dijkstra for pathfinding.
			</li>
		</ul>

		<h3>Usage</h3>
		<pre><code>import &#123; generateLabyrinth, Labyrinth &#125; from 'labyrinth';

const graph = generateLabyrinth(20, 20);

&lt;Labyrinth
  &#123;graph&#125;
  algorithm="astar"
  cellSize=&#123;30&#125;
  animationSpeed=&#123;50&#125;
  showGrid={false}
  legend={false}
  stepCount={false}
/&gt;</code></pre>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	.subtitle {
		text-align: center;
		color: #6b7280;
		margin-bottom: 2rem;
		font-size: 1.125rem;
	}

	.config-panel {
		background-color: #f9fafb;
		padding: 1.5rem;
		border-radius: 0.75rem;
		margin-bottom: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.config-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: #374151;
		font-size: 0.875rem;
	}

	input[type="range"] {
		width: 100%;
	}

	select {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background-color: white;
		font-size: 0.875rem;
	}

	.regenerate-btn {
		padding: 0.75rem 1.5rem;
		background-color: #10b981;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 600;
		transition: background-color 0.2s;
		grid-column: 1 / -1;
	}

	.regenerate-btn:hover {
		background-color: #059669;
	}

	.info-section {
		margin-top: 3rem;
		padding: 2rem;
		background-color: #f9fafb;
		border-radius: 0.75rem;
	}

	.info-section h2 {
		font-size: 1.875rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.info-section h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #374151;
	}

	.info-section p {
		color: #4b5563;
		line-height: 1.75;
		margin-bottom: 1rem;
	}

	.info-section ul {
		list-style-type: disc;
		margin-left: 1.5rem;
		color: #4b5563;
		line-height: 1.75;
	}

	.info-section li {
		margin-bottom: 0.5rem;
	}

	pre {
		background-color: #1f2937;
		color: #f9fafb;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin-top: 1rem;
	}

	code {
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
	}
</style>
