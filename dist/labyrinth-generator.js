function createKey(x, y) {
    return `${x},${y}`;
}
function parseKey(key) {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
}
export function generateLabyrinth(width, height) {
    const cells = [];
    for (let y = 0; y < height; y++) {
        cells[y] = [];
        for (let x = 0; x < width; x++) {
            cells[y][x] = {
                x,
                y,
                walls: {
                    top: true,
                    right: true,
                    bottom: true,
                    left: true
                },
                visited: false
            };
        }
    }
    const stack = [];
    const startCell = cells[0][0];
    startCell.visited = true;
    stack.push(startCell);
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current, cells, width, height);
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(current, next);
            next.visited = true;
            stack.push(next);
        }
        else {
            stack.pop();
        }
    }
    return cellsToGraph(cells, width, height);
}
function getUnvisitedNeighbors(cell, cells, width, height) {
    const neighbors = [];
    const { x, y } = cell;
    if (y > 0 && !cells[y - 1][x].visited)
        neighbors.push(cells[y - 1][x]);
    if (x < width - 1 && !cells[y][x + 1].visited)
        neighbors.push(cells[y][x + 1]);
    if (y < height - 1 && !cells[y + 1][x].visited)
        neighbors.push(cells[y + 1][x]);
    if (x > 0 && !cells[y][x - 1].visited)
        neighbors.push(cells[y][x - 1]);
    return neighbors;
}
function removeWall(cell1, cell2) {
    const dx = cell2.x - cell1.x;
    const dy = cell2.y - cell1.y;
    if (dx === 1) {
        cell1.walls.right = false;
        cell2.walls.left = false;
    }
    else if (dx === -1) {
        cell1.walls.left = false;
        cell2.walls.right = false;
    }
    else if (dy === 1) {
        cell1.walls.bottom = false;
        cell2.walls.top = false;
    }
    else if (dy === -1) {
        cell1.walls.top = false;
        cell2.walls.bottom = false;
    }
}
function cellsToGraph(cells, width, height) {
    const nodes = new Map();
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = cells[y][x];
            const nodeId = createKey(x, y);
            const neighbors = [];
            if (!cell.walls.top && y > 0) {
                neighbors.push(createKey(x, y - 1));
            }
            if (!cell.walls.right && x < width - 1) {
                neighbors.push(createKey(x + 1, y));
            }
            if (!cell.walls.bottom && y < height - 1) {
                neighbors.push(createKey(x, y + 1));
            }
            if (!cell.walls.left && x > 0) {
                neighbors.push(createKey(x - 1, y));
            }
            nodes.set(nodeId, {
                id: nodeId,
                x,
                y,
                neighbors
            });
        }
    }
    return { nodes, width, height };
}
