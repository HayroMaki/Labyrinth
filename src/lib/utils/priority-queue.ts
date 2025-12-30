interface PriorityQueueItem<T> {
	element: T;
	priority: number;
}

export class PriorityQueue<T> {
	private items: PriorityQueueItem<T>[] = [];

	enqueue(element: T, priority: number): void {
		const item = { element, priority };
		let added = false;

		for (let i = 0; i < this.items.length; i++) {
			if (item.priority < this.items[i].priority) {
				this.items.splice(i, 0, item);
				added = true;
				break;
			}
		}

		if (!added) {
			this.items.push(item);
		}
	}

	dequeue(): T | undefined {
		return this.items.shift()?.element;
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	size(): number {
		return this.items.length;
	}
}
