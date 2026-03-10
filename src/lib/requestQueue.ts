/**
 * requestQueue.ts
 * 
 * A singleton queue manager for critical API calls.
 * Ensures requests are serialized, retried with exponential backoff,
 * and provides observable state for UI feedback.
 */

export type QueueItemStatus = "pending" | "processing" | "done" | "failed";

export interface QueueItem<T = unknown> {
    id: string;
    label: string;
    task: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
    status: QueueItemStatus;
    attempt: number;
    maxAttempts: number;
    position: number;
}

type QueueListener = (items: QueueItem[]) => void;

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

class RequestQueue {
    private queue: QueueItem[] = [];
    private isProcessing = false;
    private listeners: Set<QueueListener> = new Set();

    subscribe(fn: QueueListener) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    private notify() {
        // Emit a snapshot so listeners see current positions
        const snapshot = this.queue.map((item, i) => ({ ...item, position: i + 1 }));
        this.listeners.forEach((fn) => fn(snapshot));
    }

    enqueue<T>(label: string, task: () => Promise<T>, maxAttempts = MAX_ATTEMPTS): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const item: QueueItem<T> = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                label,
                task,
                resolve,
                reject,
                status: "pending",
                attempt: 0,
                maxAttempts,
                position: this.queue.length + 1,
            };

            this.queue.push(item as QueueItem);
            this.notify();
            this.process();
        });
    }

    private async process() {
        if (this.isProcessing) return;

        const item = this.queue.find((i) => i.status === "pending");
        if (!item) return;

        this.isProcessing = true;
        item.status = "processing";
        this.notify();

        while (item.attempt < item.maxAttempts) {
            item.attempt++;
            try {
                const result = await item.task();
                item.status = "done";
                item.resolve(result);
                break;
            } catch (err) {
                if (item.attempt >= item.maxAttempts) {
                    item.status = "failed";
                    item.reject(err);
                    break;
                }
                // Exponential backoff: 1s, 2s, 4s...
                const delay = BASE_DELAY_MS * Math.pow(2, item.attempt - 1);
                await sleep(delay);
            }
        }

        // Remove processed item and continue
        this.queue = this.queue.filter((i) => i.id !== item.id);
        this.notify();
        this.isProcessing = false;
        this.process();
    }

    getQueue(): QueueItem[] {
        return this.queue.map((item, i) => ({ ...item, position: i + 1 }));
    }

    clear() {
        this.queue = [];
        this.notify();
    }
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Singleton — one queue for the whole app
export const requestQueue = new RequestQueue();
