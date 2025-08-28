import { ApiResponse } from './auth';

// Scheduler Types
export interface SchedulerStatus {
    is_running: boolean;
    last_run: string;
    next_run: string;
    jobs: {
        name: string;
        status: 'running' | 'scheduled' | 'completed' | 'failed';
        last_execution: string;
        next_execution: string;
    }[];
}

// Health Check Types
export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: {
        database: boolean;
        redis: boolean;
        external_apis: boolean;
    };
    version: string;
    uptime: number;
    authentication?: {
        is_authenticated: boolean;
        user_id?: string;
    };
}

// Error Types
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}

// Response Types
export type SchedulerStatusResponse = ApiResponse<SchedulerStatus>;
export type HealthResponse = ApiResponse<HealthStatus>;
