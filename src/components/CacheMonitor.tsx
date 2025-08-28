import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, ProgressBar, Row, Spinner } from 'react-bootstrap';
import { API_ENDPOINTS } from '../config/api';

interface CacheStatus {
    status: string;
    ttl_seconds?: number;
    ttl_human?: string;
    count?: number;
    timestamp?: string;
    source?: string;
    version?: string;
}

const CacheMonitor: React.FC = () => {
    const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchCacheStatus = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(API_ENDPOINTS.CACHE_STATUS);
            if (response.data.success) {
                setCacheStatus(response.data.cache_status);
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

    const refreshCache = async () => {
        setRefreshing(true);
        setError('');

        try {
            const response = await axios.post(API_ENDPOINTS.CACHE_REFRESH);
            if (response.data.success) {
                // Refresh the status after successful refresh
                await fetchCacheStatus();
            } else {
                setError('Failed to refresh cache');
            }
        } catch (error) {
            console.error('Error refreshing cache:', error);
            setError('Failed to refresh cache');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCacheStatus();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchCacheStatus, 30000);
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
        // Assuming 24-hour TTL (86400 seconds)
        const maxTTL = 24 * 60 * 60;
        return Math.max(0, Math.min(100, (ttlSeconds / maxTTL) * 100));
    };

    const getTTLVariant = (percentage: number) => {
        if (percentage > 75) return 'success';
        if (percentage > 50) return 'warning';
        if (percentage > 25) return 'info';
        return 'danger';
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2 className="text-primary">
                        <i className="fas fa-database me-2"></i>
                        Yahoo Finance Cache Monitor
                    </h2>
                    <p className="text-muted">
                        Monitor the status and performance of Yahoo Finance data caching
                    </p>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="fas fa-chart-line me-2"></i>
                                Cache Status Overview
                            </h5>
                            <div>
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    onClick={fetchCacheStatus}
                                    disabled={loading}
                                    className="me-2"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sync-alt me-1"></i>
                                            Refresh
                                        </>
                                    )}
                                </Button>
                                {lastUpdated && (
                                    <small className="text-light">
                                        Last updated: {lastUpdated.toLocaleTimeString()}
                                    </small>
                                )}
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {error && (
                                <Alert variant="danger" dismissible onClose={() => setError('')}>
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            {cacheStatus ? (
                                <Row>
                                    <Col lg={6} className="mb-3">
                                        <div className="d-flex align-items-center mb-3">
                                            <h6 className="mb-0 me-3">Status:</h6>
                                            {getStatusBadge(cacheStatus.status)}
                                        </div>

                                        {cacheStatus.count && (
                                            <div className="mb-3">
                                                <h6>Records Cached:</h6>
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-chart-bar text-primary me-2"></i>
                                                    <span className="fs-5 fw-bold">{cacheStatus.count}</span>
                                                    <span className="text-muted ms-2">stocks</span>
                                                </div>
                                            </div>
                                        )}

                                        {cacheStatus.ttl_seconds && (
                                            <div className="mb-3">
                                                <h6>Time to Live:</h6>
                                                <div className="mb-2">
                                                    <span className="fw-bold">{cacheStatus.ttl_human}</span>
                                                </div>
                                                <ProgressBar
                                                    now={getTTLPercentage(cacheStatus.ttl_seconds)}
                                                    variant={getTTLVariant(getTTLPercentage(cacheStatus.ttl_seconds))}
                                                    className="mb-1"
                                                />
                                                <small className="text-muted">
                                                    {Math.round(getTTLPercentage(cacheStatus.ttl_seconds))}% of TTL remaining
                                                </small>
                                            </div>
                                        )}
                                    </Col>

                                    <Col lg={6} className="mb-3">
                                        {cacheStatus.timestamp && (
                                            <div className="mb-3">
                                                <h6>Created:</h6>
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-clock text-info me-2"></i>
                                                    <span>{formatTimestamp(cacheStatus.timestamp)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {cacheStatus.source && (
                                            <div className="mb-3">
                                                <h6>Data Source:</h6>
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-external-link-alt text-success me-2"></i>
                                                    <span>{cacheStatus.source}</span>
                                                </div>
                                            </div>
                                        )}

                                        {cacheStatus.version && (
                                            <div className="mb-3">
                                                <h6>Cache Version:</h6>
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-code text-warning me-2"></i>
                                                    <span>{cacheStatus.version}</span>
                                                </div>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin fa-2x text-muted mb-3"></i>
                                    <p className="text-muted">No cache status available</p>
                                </div>
                            )}

                            {cacheStatus?.status === 'cached' && (
                                <div className="mt-4 pt-3 border-top">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <h6 className="mb-2">Cache Management:</h6>
                                            <p className="text-muted mb-0">
                                                Force refresh to fetch fresh data from Yahoo Finance
                                            </p>
                                        </div>
                                        <Button
                                            variant="warning"
                                            onClick={refreshCache}
                                            disabled={refreshing}
                                            size="lg"
                                        >
                                            {refreshing ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Refreshing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-sync me-2"></i>
                                                    Force Refresh Cache
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-info text-white">
                            <h6 className="mb-0">
                                <i className="fas fa-info-circle me-2"></i>
                                Cache Information
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h6>Performance Benefits:</h6>
                                    <ul className="list-unstyled">
                                        <li><i className="fas fa-check text-success me-2"></i>1,800x faster than fresh Yahoo Finance fetches</li>
                                        <li><i className="fas fa-check text-success me-2"></i>Automatic 24-hour TTL with refresh</li>
                                        <li><i className="fas fa-check text-success me-2"></i>Fallback to mock data if Yahoo Finance fails</li>
                                    </ul>
                                </Col>
                                <Col md={6}>
                                    <h6>Cache Features:</h6>
                                    <ul className="list-unstyled">
                                        <li><i className="fas fa-shield-alt text-primary me-2"></i>Real-time status monitoring</li>
                                        <li><i className="fas fa-clock text-warning me-2"></i>Auto-refresh every 30 seconds</li>
                                        <li><i className="fas fa-tools text-info me-2"></i>Manual refresh capability</li>
                                    </ul>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CacheMonitor; 