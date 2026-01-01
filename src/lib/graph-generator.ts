import type { GeneralGraph, GeneralGraphNode } from './types';

export interface GraphGeneratorOptions {
	nodeCount: number;
	avgDegree: number;
	seed?: number;
}

function seededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

export function generateRandomGraph(options: GraphGeneratorOptions): GeneralGraph {
	const { nodeCount, avgDegree, seed } = options;
	const random = seed !== undefined ? seededRandom(seed) : Math.random;
	
	const nodes = new Map<string, GeneralGraphNode>();
	
	// Create nodes in a circular layout for better visualization
	const radius = 200;
	const centerX = 300;
	const centerY = 300;
	
	for (let i = 0; i < nodeCount; i++) {
		const angle = (i / nodeCount) * 2 * Math.PI;
		const x = centerX + radius * Math.cos(angle);
		const y = centerY + radius * Math.sin(angle);
		
		nodes.set(`n${i}`, {
			id: `n${i}`,
			x,
			y,
			neighbors: []
		});
	}
	
	// Connect nodes to create a connected graph
	// First, create a spanning tree to ensure connectivity
	const nodeIds = Array.from(nodes.keys());
	const connected = new Set<string>([nodeIds[0]]);
	const unconnected = new Set(nodeIds.slice(1));
	
	while (unconnected.size > 0) {
		const connectedNode = Array.from(connected)[Math.floor(random() * connected.size)];
		const unconnectedNode = Array.from(unconnected)[Math.floor(random() * unconnected.size)];
		
		nodes.get(connectedNode)!.neighbors.push(unconnectedNode);
		nodes.get(unconnectedNode)!.neighbors.push(connectedNode);
		
		connected.add(unconnectedNode);
		unconnected.delete(unconnectedNode);
	}
	
	// Add additional edges to reach target average degree
	const targetEdges = Math.floor((nodeCount * avgDegree) / 2);
	const currentEdges = nodeCount - 1; // from spanning tree
	const edgesToAdd = targetEdges - currentEdges;
	
	for (let i = 0; i < edgesToAdd; i++) {
		const node1Id = nodeIds[Math.floor(random() * nodeIds.length)];
		const node2Id = nodeIds[Math.floor(random() * nodeIds.length)];
		
		if (node1Id === node2Id) continue;
		
		const node1 = nodes.get(node1Id)!;
		const node2 = nodes.get(node2Id)!;
		
		if (!node1.neighbors.includes(node2Id)) {
			node1.neighbors.push(node2Id);
			node2.neighbors.push(node1Id);
		}
	}
	
	return { nodes };
}
