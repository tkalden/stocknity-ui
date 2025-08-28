import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface CacheStatus {
    status: string;
    ttl_seconds?: number;
    ttl_human?: string;
    count?: number;
    timestamp?: string;
    source?: string;
    version?: string;
}

interface CacheResponse {
    success: boolean;
    cache_status: CacheStatus;
    is_fresh: boolean;
    recommendation: string;
}

const AnnualReturnsCacheMonitor: React.FC = () => {
    const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
    const [isFresh, setIsFresh] = useState(false);
    const [recommendation, setRecommendation] = useState('');
    const [loading, setLoading] = useState(false);
    const [preWarming, setPreWarming] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchCacheStatus = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get<CacheResponse>(`${API_BASE_URL}${API_ENDPOINTS.CACHE_ANNUAL_RETURNS_STATUS}`);
            if (response.data.success) {
                setCacheStatus(response.data.cache_status);
                setIsFresh(response.data.is_fresh);
                setRecommendation(response.data.recommendation);
                setLastUpdated(new Date());
            } else {
                setError('Failed to fetch cache status');
            }
        } catch (error) {
            console.error('Error fetching cache status:', error);
            setError('Failed to fetch cache status');
        } finally {
            setLoading(false);
        }
    };

    const preWarmCache = async () => {
        setPreWarming(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CACHE_PRE_WARM}`);
            if (response.data.success) {
                // Refresh the status after successful pre-warm
                await fetchCacheStatus();
                alert('Cache pre-warmed successfully!');
            } else {
                setError('Failed to pre-warm cache');
            }
        } catch (error) {
            console.error('Error pre-warming cache:', error);
            setError('Failed to pre-warm cache');
        } finally {
            setPreWarming(false);
        }
    };

    useEffect(() => {
        fetchCacheStatus();

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchCacheStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'cached':
                return <Badge bg="success" className="fs-6">CACHED</Badge>;
            case 'not_cached':
                return <Badge bg="warning" className="fs-6">NOT CACHED</Badge>;
            case 'redis_unavailable':
                return <Badge bg="danger" className="fs-6">REDIS UNAVAILABLE</Badge>;
            default:
                return <Badge bg="secondary" className="fs-6">{status.toUpperCase()}</Badge>;
        }
    };

    const getFreshnessBadge = (fresh: boolean) => {
        return fresh ?
            <Badge bg="success" className="fs-6">FRESH</Badge> :
            <Badge bg="warning" className="fs-6">AGING</Badge>;
    };

    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleString();
        } catch {
            return timestamp;
        }
    };

    const getTTLPercentage = (ttlSeconds?: number) => {
        if (!ttlSeconds || ttlSeconds <= 0) return 0;
        // Assuming 48-hour TTL (172800 seconds)
        const maxTTL = 48 * 60 * 60;
        return Math.max(0, Math.min(100, (ttlSeconds / maxTTL) * 100));
    };

    const getTTLVariant = (percentage: number) => {
        if (percentage > 75) return 'success';
        if (percentage > 50) return 'info';
        if (percentage > 25) return 'warning';
        return 'danger';
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Header as="h4">
                            Annual Returns Cache Monitor
                            <small className="text-muted ms-2">
                                {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                            </small>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError('')}>
                                    <strong>Error:</strong> {error}
                                </Alert>
                            )}

                            {loading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Loading cache status...</p>
                                </div>
                            ) : cacheStatus ? (
                                <Row>
                                    <Col md={6}>
                                        <h5>Cache Status</h5>
                                        <div className="mb-3">
                                            <strong>Status:</strong> {getStatusBadge(cacheStatus.status)}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Freshness:</strong> {getFreshnessBadge(isFresh)}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Stocks Cached:</strong> {cacheStatus.count || 0}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Source:</strong> {cacheStatus.source || 'Unknown'}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Version:</strong> {cacheStatus.version || 'Unknown'}
                                        </div>
                                        <div className="mb-3">
                                            <strong>Last Updated:</strong> {formatTimestamp(cacheStatus.timestamp || '')}
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <h5>Cache TTL</h5>
                                        <div className="mb-3">
                                            <strong>Time Remaining:</strong> {cacheStatus.ttl_human || 'N/A'}
                                        </div>
                                        {cacheStatus.ttl_seconds && (
                                            <div className="mb-3">
                                                <strong>TTL Progress:</strong>
                                                <div className="progress mt-1">
                                                    <div
                                                        className={`progress-bar bg-${getTTLVariant(getTTLPercentage(cacheStatus.ttl_seconds))}`}
                                                        style={{ width: `${getTTLPercentage(cacheStatus.ttl_seconds)}%` }}
                                                    >
                                                        {Math.round(getTTLPercentage(cacheStatus.ttl_seconds))}%
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <strong>Recommendation:</strong>
                                            <Badge bg={recommendation === 'cache_ok' ? 'success' : 'warning'} className="ms-2">
                                                {recommendation === 'cache_ok' ? 'Cache OK' : 'Pre-warm Recommended'}
                                            </Badge>
                                        </div>
                                    </Col>
                                </Row>
                            ) : (
                                <div className="text-center py-4">
                                    <p>No cache status available</p>
                                </div>
                            )}

                            <div className="mt-4">
                                <Button
                                    variant="primary"
                                    onClick={fetchCacheStatus}
                                    disabled={loading}
                                    className="me-2"
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Refresh Status'}
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={preWarmCache}
                                    disabled={preWarming || cacheStatus?.status !== 'cached'}
                                >
                                    {preWarming ? <Spinner animation="border" size="sm" /> : 'Pre-warm Cache'}
                                </Button>
                            </div>

                            <div className="mt-3">
                                <small className="text-muted">
                                    <strong>Note:</strong> Pre-warming the cache fetches fresh annual returns data from Yahoo Finance.
                                    This may take 1-2 minutes but will significantly improve screener performance.
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AnnualReturnsCacheMonitor;
