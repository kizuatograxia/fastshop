import { useEffect, useState, useCallback } from "react";
import { requestQueue, QueueItem } from "@/lib/requestQueue";

export function useRequestQueue() {
    const [items, setItems] = useState<QueueItem[]>(requestQueue.getQueue());

    useEffect(() => {
        const unsubscribe = requestQueue.subscribe(setItems);
        // Return a proper cleanup function (void return type)
        return () => { unsubscribe(); };
    }, []);

    const enqueue = useCallback(
        <T>(label: string, task: () => Promise<T>, maxAttempts?: number) =>
            requestQueue.enqueue(label, task, maxAttempts),
        []
    );

    const pendingCount = items.filter((i) => i.status === "pending").length;
    const isProcessing = items.some((i) => i.status === "processing");
    const currentItem = items.find((i) => i.status === "processing");

    return { items, enqueue, pendingCount, isProcessing, currentItem };
}
