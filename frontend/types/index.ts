export interface Question {
    id: string;
    event_id: string;
    content: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    is_visible: boolean;
    created_at: string;
}

export interface Event {
    id: string;
    title: string;
    event_code: string;
    is_active: boolean;
    created_at: string;
}

export interface ApiError {
    error: string;
    details?: Record<string, string[]>;
}
