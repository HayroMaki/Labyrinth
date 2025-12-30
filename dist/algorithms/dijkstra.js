import { PriorityQueue } from '../utils/priority-queue';
export function dijkstra(graph, startId, endId) {
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const steps = [];
    const pq = new PriorityQueue();
    for (const nodeId of graph.nodes.keys()) {
        distances.set(nodeId, Infinity);
        previous.set(nodeId, null);
    }
    distances.set(startId, 0);
    pq.enqueue(startId, 0);
    while (!pq.isEmpty()) {
        const currentId = pq.dequeue();
        if (!currentId)
            break;
        if (visited.has(currentId))
            continue;
        visited.add(currentId);
        steps.push({
            nodeId: currentId,
            type: 'current',
            distance: distances.get(currentId)
        });
        if (currentId === endId) {
            break;
        }
        const currentNode = graph.nodes.get(currentId);
        if (!currentNode)
            continue;
        const currentDistance = distances.get(currentId) ?? Infinity;
        for (const neighborId of currentNode.neighbors) {
            if (visited.has(neighborId))
                continue;
            const newDistance = currentDistance + 1;
            const oldDistance = distances.get(neighborId) ?? Infinity;
            if (newDistance < oldDistance) {
                distances.set(neighborId, newDistance);
                previous.set(neighborId, currentId);
                pq.enqueue(neighborId, newDistance);
                steps.push({
                    nodeId: neighborId,
                    type: 'visiting',
                    distance: newDistance
                });
            }
        }
        steps.push({
            nodeId: currentId,
            type: 'visited',
            distance: distances.get(currentId)
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
function reconstructPath(previous, startId, endId) {
    const path = [];
    let current = endId;
    while (current !== null) {
        path.unshift(current);
        if (current === startId)
            break;
        current = previous.get(current) ?? null;
    }
    if (path[0] !== startId) {
        return [];
    }
    return path;
}
