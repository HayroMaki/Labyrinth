import type { GeneralGraph, BFSResult, BFSStep } from '../types';

export function bidirectionalBFS(
	graph: GeneralGraph,
	startId: string,
	endId: string
): BFSResult {
	const steps: BFSStep[] = [];
	
	// Forward search from start
	const forwardQueue: string[][] = [[startId]];
	const forwardVisited = new Map<string, string[]>();
	forwardVisited.set(startId, [startId]);
	
	// Backward search from end
	const backwardQueue: string[][] = [[endId]];
	const backwardVisited = new Map<string, string[]>();
	backwardVisited.set(endId, [endId]);
	
	steps.push({ nodeId: startId, type: 'start-forward', side: 'forward', level: 0 });
	steps.push({ nodeId: endId, type: 'start-backward', side: 'backward', level: 0 });
	
	let level = 0;
	
	while (forwardQueue.length > 0 && backwardQueue.length > 0) {
		level++;
		
		// Process entire forward level
		const forwardLevelSize = forwardQueue.length;
		const forwardNewLevel: string[][] = [];
		
		for (let i = 0; i < forwardLevelSize; i++) {
			const currentPath = forwardQueue.shift()!;
			const currentId = currentPath[currentPath.length - 1];
			
			steps.push({ nodeId: currentId, type: 'current-forward', side: 'forward', level });
			
			const currentNode = graph.nodes.get(currentId);
			if (!currentNode) continue;
			
			for (const neighborId of currentNode.neighbors) {
				// Check for intersection with backward search
				if (backwardVisited.has(neighborId)) {
					const backwardPath = backwardVisited.get(neighborId)!;
					const fullPath = [...currentPath, ...backwardPath.slice().reverse()];
					
					steps.push({ nodeId: neighborId, type: 'intersection', level });
					
					// Mark final path
					for (const nodeId of fullPath) {
						steps.push({ nodeId, type: 'path' });
					}
					
					return {
						path: fullPath,
						steps,
						found: true,
						intersectionNode: neighborId
					};
				}
				
				if (!forwardVisited.has(neighborId)) {
					const newPath = [...currentPath, neighborId];
					forwardVisited.set(neighborId, newPath);
					forwardNewLevel.push(newPath);
					
					steps.push({ nodeId: neighborId, type: 'goal-forward', side: 'forward', level });
				}
			}
			
			steps.push({ nodeId: currentId, type: 'visited-forward', side: 'forward', level });
		}
		
		forwardQueue.push(...forwardNewLevel);
		
		// Process entire backward level
		const backwardLevelSize = backwardQueue.length;
		const backwardNewLevel: string[][] = [];
		
		for (let i = 0; i < backwardLevelSize; i++) {
			const currentPath = backwardQueue.shift()!;
			const currentId = currentPath[currentPath.length - 1];
			
			steps.push({ nodeId: currentId, type: 'current-backward', side: 'backward', level });
			
			const currentNode = graph.nodes.get(currentId);
			if (!currentNode) continue;
			
			for (const neighborId of currentNode.neighbors) {
				// Check for intersection with forward search
				if (forwardVisited.has(neighborId)) {
					const forwardPath = forwardVisited.get(neighborId)!;
					const fullPath = [...forwardPath, ...currentPath.slice().reverse()];
					
					steps.push({ nodeId: neighborId, type: 'intersection', level });
					
					// Mark final path
					for (const nodeId of fullPath) {
						steps.push({ nodeId, type: 'path' });
					}
					
					return {
						path: fullPath,
						steps,
						found: true,
						intersectionNode: neighborId
					};
				}
				
				if (!backwardVisited.has(neighborId)) {
					const newPath = [...currentPath, neighborId];
					backwardVisited.set(neighborId, newPath);
					backwardNewLevel.push(newPath);
					
					steps.push({ nodeId: neighborId, type: 'goal-backward', side: 'backward', level });
				}
			}
			
			steps.push({ nodeId: currentId, type: 'visited-backward', side: 'backward', level });
		}
		
		backwardQueue.push(...backwardNewLevel);
	}
	
	return {
		path: [],
		steps,
		found: false
	};
}

function permutations<T>(arr: T[]): T[][] {
	if (arr.length <= 1) return [arr];
	
	const result: T[][] = [];
	for (let i = 0; i < arr.length; i++) {
		const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
		const perms = permutations(rest);
		for (const perm of perms) {
			result.push([arr[i], ...perm]);
		}
	}
	return result;
}

export function findOptimalMultiGoalPath(
	graph: GeneralGraph,
	startId: string,
	goalIds: string[]
): { optimalPath: string[]; allPaths: Map<string, Map<string, string[]>> } {
	const allPaths = new Map<string, Map<string, string[]>>();
	
	// Compute paths between all pairs
	const allNodes = [startId, ...goalIds];
	for (const from of allNodes) {
		const pathsFrom = new Map<string, string[]>();
		for (const to of allNodes) {
			if (from !== to) {
				const result = bidirectionalBFS(graph, from, to);
				if (result.found) {
					pathsFrom.set(to, result.path);
				}
			}
		}
		allPaths.set(from, pathsFrom);
	}
	
	// Try all permutations to find shortest tour
	let shortestPath: string[] = [];
	let shortestLength = Infinity;
	
	const goalPermutations = permutations(goalIds);
	
	for (const perm of goalPermutations) {
		const tour = [startId, ...perm];
		let totalPath: string[] = [];
		let valid = true;
		
		for (let i = 0; i < tour.length - 1; i++) {
			const segment = allPaths.get(tour[i])?.get(tour[i + 1]);
			if (!segment) {
				valid = false;
				break;
			}
			if (i === 0) {
				totalPath = [...segment];
			} else {
				totalPath = [...totalPath.slice(0, -1), ...segment];
			}
		}
		
		if (valid && totalPath.length < shortestLength) {
			shortestPath = totalPath;
			shortestLength = totalPath.length;
		}
	}
	
	return { optimalPath: shortestPath, allPaths };
}
