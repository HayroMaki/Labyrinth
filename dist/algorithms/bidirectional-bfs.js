export function bidirectionalBFS(graph, startId, endId) {
    const steps = [];
    // Forward search from start
    const forwardQueue = [[startId]];
    const forwardVisited = new Map();
    forwardVisited.set(startId, [startId]);
    // Backward search from end
    const backwardQueue = [[endId]];
    const backwardVisited = new Map();
    backwardVisited.set(endId, [endId]);
    steps.push({ nodeId: startId, type: 'start-forward', side: 'forward', level: 0 });
    steps.push({ nodeId: endId, type: 'start-backward', side: 'backward', level: 0 });
    let level = 0;
    while (forwardQueue.length > 0 && backwardQueue.length > 0) {
        level++;
        // Process entire forward level
        const forwardLevelSize = forwardQueue.length;
        const forwardNewLevel = [];
        for (let i = 0; i < forwardLevelSize; i++) {
            const currentPath = forwardQueue.shift();
            const currentId = currentPath[currentPath.length - 1];
            steps.push({ nodeId: currentId, type: 'current-forward', side: 'forward', level });
            const currentNode = graph.nodes.get(currentId);
            if (!currentNode)
                continue;
            for (const neighborId of currentNode.neighbors) {
                // Check for intersection with backward search
                if (backwardVisited.has(neighborId)) {
                    const backwardPath = backwardVisited.get(neighborId);
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
        const backwardNewLevel = [];
        for (let i = 0; i < backwardLevelSize; i++) {
            const currentPath = backwardQueue.shift();
            const currentId = currentPath[currentPath.length - 1];
            steps.push({ nodeId: currentId, type: 'current-backward', side: 'backward', level });
            const currentNode = graph.nodes.get(currentId);
            if (!currentNode)
                continue;
            for (const neighborId of currentNode.neighbors) {
                // Check for intersection with forward search
                if (forwardVisited.has(neighborId)) {
                    const forwardPath = forwardVisited.get(neighborId);
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
function permutations(arr) {
    if (arr.length <= 1)
        return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
        const perms = permutations(rest);
        for (const perm of perms) {
            result.push([arr[i], ...perm]);
        }
    }
    return result;
}
export function findOptimalMultiGoalPath(graph, startId, goalIds) {
    const allPaths = new Map();
    const permutationSteps = [];
    const testedPermutations = [];
    // Compute paths between all pairs
    const allNodes = [startId, ...goalIds];
    for (const from of allNodes) {
        const pathsFrom = new Map();
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
    let shortestPath = [];
    let shortestLength = Infinity;
    let bestPermIndex = -1;
    const goalPermutations = permutations(goalIds);
    // First pass: find all valid permutations and the best one
    for (let permIndex = 0; permIndex < goalPermutations.length; permIndex++) {
        const perm = goalPermutations[permIndex];
        const tour = [startId, ...perm];
        let totalPath = [];
        let valid = true;
        for (let i = 0; i < tour.length - 1; i++) {
            const segment = allPaths.get(tour[i])?.get(tour[i + 1]);
            if (!segment) {
                valid = false;
                break;
            }
            if (i === 0) {
                totalPath = [...segment];
            }
            else {
                totalPath = [...totalPath.slice(0, -1), ...segment];
            }
        }
        if (valid) {
            testedPermutations.push({ path: totalPath, length: totalPath.length, tour });
            if (totalPath.length < shortestLength) {
                shortestPath = totalPath;
                shortestLength = totalPath.length;
                bestPermIndex = permIndex;
            }
        }
    }
    // Second pass: create visualization steps - test all permutations first, then show best
    for (let i = 0; i < testedPermutations.length; i++) {
        const perm = testedPermutations[i];
        // Always show as 'test' during iteration
        for (const nodeId of perm.path) {
            permutationSteps.push({
                nodeId,
                type: 'permutation-test',
                permutationIndex: i,
                permutationPath: perm.path,
                permutationLength: perm.length,
                isBest: false
            });
        }
    }
    // Finally, show the best permutation
    if (bestPermIndex >= 0 && testedPermutations[bestPermIndex]) {
        const bestPerm = testedPermutations[bestPermIndex];
        for (const nodeId of bestPerm.path) {
            permutationSteps.push({
                nodeId,
                type: 'permutation-best',
                permutationIndex: bestPermIndex,
                permutationPath: bestPerm.path,
                permutationLength: bestPerm.length,
                isBest: true
            });
        }
    }
    return { optimalPath: shortestPath, allPaths, permutationSteps, testedPermutations };
}
