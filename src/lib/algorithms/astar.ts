import type { Graph, AlgorithmResult, PathStep } from '../types';
import { PriorityQueue } from '../utils/priority-queue';

function parseKey(key: string): { x: number; y: number } {
	const [x, y] = key.split(',').map(Number);
	return { x, y };
}

function manhattanDistance(id1: string, id2: string): number {
	const pos1 = parseKey(id1);
	const pos2 = parseKey(id2);
	return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

export function astar(graph: Graph, startId: string, endId: string): AlgorithmResult {
	const gScore = new Map<string, number>();
	const fScore = new Map<string, number>();
	const previous = new Map<string, string | null>();
	const visited = new Set<string>();
	const steps: PathStep[] = [];
	const pq = new PriorityQueue<string>();

	for (const nodeId of graph.nodes.keys()) {
		gScore.set(nodeId, Infinity);
		fScore.set(nodeId, Infinity);
		previous.set(nodeId, null);
	}

	const h = manhattanDistance(startId, endId);
	gScore.set(startId, 0);
	fScore.set(startId, h);
	pq.enqueue(startId, h);

	while (!pq.isEmpty()) {
		const currentId = pq.dequeue();
		if (!currentId) break;

		if (visited.has(currentId)) continue;
		visited.add(currentId);

		const currentG = gScore.get(currentId) ?? Infinity;
		const currentF = fScore.get(currentId) ?? Infinity;
		const currentH = manhattanDistance(currentId, endId);

		steps.push({
			nodeId: currentId,
			type: 'current',
			distance: currentG,
			heuristic: currentH,
			fScore: currentF
		});

		if (currentId === endId) {
			break;
		}

		const currentNode = graph.nodes.get(currentId);
		if (!currentNode) continue;

		for (const neighborId of currentNode.neighbors) {
			if (visited.has(neighborId)) continue;

			const tentativeGScore = currentG + 1;
			const oldGScore = gScore.get(neighborId) ?? Infinity;

			if (tentativeGScore < oldGScore) {
				previous.set(neighborId, currentId);
				gScore.set(neighborId, tentativeGScore);
				const heuristic = manhattanDistance(neighborId, endId);
				const newFScore = tentativeGScore + heuristic;
				fScore.set(neighborId, newFScore);
				pq.enqueue(neighborId, newFScore);

				steps.push({
					nodeId: neighborId,
					type: 'visiting',
					distance: tentativeGScore,
					heuristic,
					fScore: newFScore
				});
			}
		}

		steps.push({
			nodeId: currentId,
			type: 'visited',
			distance: currentG,
			heuristic: currentH,
			fScore: currentF
		});
	}

	const path = reconstructPath(previous, startId, endId);
	
	for (const nodeId of path) {
		steps.push({
			nodeId,
			type: 'path'
		});
	}

	return {
		path,
		steps,
		found: path.length > 0 && path[path.length - 1] === endId
	};
}

function reconstructPath(previous: Map<string, string | null>, startId: string, endId: string): string[] {
	const path: string[] = [];
	let current: string | null = endId;

	while (current !== null) {
		path.unshift(current);
		if (current === startId) break;
		current = previous.get(current) ?? null;
	}

	if (path[0] !== startId) {
		return [];
	}

	return path;
}
