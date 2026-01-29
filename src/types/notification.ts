export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}
