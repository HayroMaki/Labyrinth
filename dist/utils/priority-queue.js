export class PriorityQueue {
    items = [];
    enqueue(element, priority) {
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
    dequeue() {
        return this.items.shift()?.element;
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
}
