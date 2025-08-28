import { ApiResponse } from './auth';

// Cache Types
export interface CacheStatus {
    is_fresh: boolean;
    stock_count: number;
    ttl: number;
    last_updated: string;
    cache_status: 'fresh' | 'stale' | 'empty';
}

export interface CacheInfo {
    total_keys: number;
    memory_usage: number;
    hit_rate: number;
    keys: {
        name: string;
        ttl: number;
        size: number;
        last_accessed: string;
    }[];
}

export interface CacheTracking {
    requests: {
        endpoint: string;
        timestamp: string;
        response_time: number;
        cache_hit: boolean;
    }[];
    summary: {
        total_requests: number;
        cache_hits: number;
        cache_misses: number;
        avg_response_time: number;
    };
}

// Response Types
export type CacheStatusResponse = ApiResponse<CacheStatus>;
export type CacheInfoResponse = ApiResponse<CacheInfo>;
export type CacheTrackingResponse = ApiResponse<CacheTracking>;
