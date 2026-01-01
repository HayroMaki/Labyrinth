import type { Cell, Graph, GraphNode } from './types';

function createKey(x: number, y: number): string {
	return `${x},${y}`;
}

function parseKey(key: string): { x: number; y: number } {
	const [x, y] = key.split(',').map(Number);
	return { x, y };
}

export function generateLabyrinth(width: number, height: number, wallRemovalPercent: number = 25): Graph {
	const cells: Cell[][] = [];
	
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

	const stack: Cell[] = [];
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
		} else {
			stack.pop();
		}
	}

	// Remove additional walls randomly to create multiple paths
	if (wallRemovalPercent > 0) {
		removeRandomWalls(cells, width, height, wallRemovalPercent);
	}

	return cellsToGraph(cells, width, height);
}

function getUnvisitedNeighbors(cell: Cell, cells: Cell[][], width: number, height: number): Cell[] {
	const neighbors: Cell[] = [];
	const { x, y } = cell;

	if (y > 0 && !cells[y - 1][x].visited) neighbors.push(cells[y - 1][x]);
	if (x < width - 1 && !cells[y][x + 1].visited) neighbors.push(cells[y][x + 1]);
	if (y < height - 1 && !cells[y + 1][x].visited) neighbors.push(cells[y + 1][x]);
	if (x > 0 && !cells[y][x - 1].visited) neighbors.push(cells[y][x - 1]);

	return neighbors;
}

function removeWall(cell1: Cell, cell2: Cell): void {
	const dx = cell2.x - cell1.x;
	const dy = cell2.y - cell1.y;

	if (dx === 1) {
		cell1.walls.right = false;
		cell2.walls.left = false;
	} else if (dx === -1) {
		cell1.walls.left = false;
		cell2.walls.right = false;
	} else if (dy === 1) {
		cell1.walls.bottom = false;
		cell2.walls.top = false;
	} else if (dy === -1) {
		cell1.walls.top = false;
		cell2.walls.bottom = false;
	}
}

function removeRandomWalls(cells: Cell[][], width: number, height: number, removalPercent: number): void {
	const allWalls: Array<{ cell: Cell; direction: 'top' | 'right' | 'bottom' | 'left' }> = [];
	
	// Collect all existing walls
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const cell = cells[y][x];
			if (cell.walls.top && y > 0) allWalls.push({ cell, direction: 'top' });
			if (cell.walls.right && x < width - 1) allWalls.push({ cell, direction: 'right' });
			if (cell.walls.bottom && y < height - 1) allWalls.push({ cell, direction: 'bottom' });
			if (cell.walls.left && x > 0) allWalls.push({ cell, direction: 'left' });
		}
	}
	
	// Calculate how many walls to remove
	const wallsToRemove = Math.floor(allWalls.length * (removalPercent / 100));
	
	// Shuffle and remove random walls
	for (let i = 0; i < wallsToRemove; i++) {
		const randomIndex = Math.floor(Math.random() * allWalls.length);
		const { cell, direction } = allWalls[randomIndex];
		
		// Remove wall from both sides
		const { x, y } = cell;
		if (direction === 'top' && y > 0) {
			cell.walls.top = false;
			cells[y - 1][x].walls.bottom = false;
		} else if (direction === 'right' && x < width - 1) {
			cell.walls.right = false;
			cells[y][x + 1].walls.left = false;
		} else if (direction === 'bottom' && y < height - 1) {
			cell.walls.bottom = false;
			cells[y + 1][x].walls.top = false;
		} else if (direction === 'left' && x > 0) {
			cell.walls.left = false;
			cells[y][x - 1].walls.right = false;
		}
		
		// Remove this wall from the array to avoid removing it twice
		allWalls.splice(randomIndex, 1);
	}
}

function cellsToGraph(cells: Cell[][], width: number, height: number): Graph {
	const nodes = new Map<string, GraphNode>();

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const cell = cells[y][x];
			const nodeId = createKey(x, y);
			const neighbors: string[] = [];

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
