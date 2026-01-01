import type { GeneralGraph, GeneralGraphNode } from './types';

export interface GraphGeneratorOptions {
	nodeCount: number;
	width?: number;
	height?: number;
	maxConnectionsPerNode?: number;
	connectionRadius?: number;
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
	const { 
		nodeCount, 
		width = 600, 
		height = 600, 
		maxConnectionsPerNode = 5,
		connectionRadius = 150,
		seed 
	} = options;
	const random = seed !== undefined ? seededRandom(seed) : Math.random;
	
	const nodes = new Map<string, GeneralGraphNode>();
	const padding = 50;
	
	// Generate node positions in a rectangular cloud
	for (let i = 0; i < nodeCount; i++) {
		const x = padding + random() * (width - 2 * padding);
		const y = padding + random() * (height - 2 * padding);
		
		nodes.set(`n${i}`, {
			id: `n${i}`,
			x,
			y,
			neighbors: []
		});
	}
	
	// Connect nodes based on proximity
	const nodeArray = Array.from(nodes.values());
	
	for (let i = 0; i < nodeArray.length; i++) {
		const node = nodeArray[i];
		
		// Skip if already at max connections
		if (node.neighbors.length >= maxConnectionsPerNode) continue;
		
		// Find nearby nodes
		const distances: Array<{ nodeId: string; distance: number }> = [];
		
		for (let j = 0; j < nodeArray.length; j++) {
			if (i === j) continue;
			
			const other = nodeArray[j];
			
			// Skip if other node is at max connections
			if (other.neighbors.length >= maxConnectionsPerNode) continue;
			
			// Skip if already connected
			if (node.neighbors.includes(other.id)) continue;
			
			const dx = node.x - other.x;
			const dy = node.y - other.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance <= connectionRadius) {
				distances.push({ nodeId: other.id, distance });
			}
		}
		
		// Sort by distance and connect to closest nodes
		distances.sort((a, b) => a.distance - b.distance);
		
		const connectionsNeeded = Math.min(
			maxConnectionsPerNode - node.neighbors.length,
			distances.length
		);
		
		for (let k = 0; k < connectionsNeeded; k++) {
			const targetId = distances[k].nodeId;
			const targetNode = nodes.get(targetId)!;
			
			// Only connect if target isn't at max
			if (targetNode.neighbors.length < maxConnectionsPerNode) {
				node.neighbors.push(targetId);
				targetNode.neighbors.push(node.id);
			}
		}
	}
	
	// Ensure all nodes have at least one connection
	for (const node of nodeArray) {
		if (node.neighbors.length === 0) {
			// Find closest node that can accept a connection
			let closestNode: GeneralGraphNode | null = null;
			let closestDistance = Infinity;
			
			for (const other of nodeArray) {
				if (other.id === node.id) continue;
				if (other.neighbors.length >= maxConnectionsPerNode) continue;
				
				const dx = node.x - other.x;
				const dy = node.y - other.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				
				if (distance < closestDistance) {
					closestDistance = distance;
					closestNode = other;
				}
			}
			
			if (closestNode) {
				node.neighbors.push(closestNode.id);
				closestNode.neighbors.push(node.id);
			}
		}
	}
	
	return { nodes };
}

export function findOppositeCornerNodes(graph: GeneralGraph): { topLeft: string; bottomRight: string } {
	const nodeArray = Array.from(graph.nodes.values());
	
	let topLeftNode = nodeArray[0];
	let bottomRightNode = nodeArray[0];
	
	for (const node of nodeArray) {
		// Top-left: minimize x + y
		if (node.x + node.y < topLeftNode.x + topLeftNode.y) {
			topLeftNode = node;
		}
		
		// Bottom-right: maximize x + y
		if (node.x + node.y > bottomRightNode.x + bottomRightNode.y) {
			bottomRightNode = node;
		}
	}
	
	return {
		topLeft: topLeftNode.id,
		bottomRight: bottomRightNode.id
	};
}
