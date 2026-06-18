import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, ProgressBar, Row, Spinner } from 'react-bootstrap';
import { API_ENDPOINTS } from '../config/api';
import { api } from '../utils/api';

interface CacheStatus {
    status: string;
    ttl_seconds?: number;
    ttl_human?: string;
    count?: number;
    timestamp?: string;
    source?: string;
}

interface BatchStatus {
    status: string;
    total?: number;
    success?: number;
    failed?: number;
    elapsedMs?: number;
    timestamp?: string;
}

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        cached: 'success',
        not_cached: 'warning',
        redis_unavailable: 'danger',
        completed: 'success',
        running: 'primary',
        failed: 'danger',
        never_run: 'secondary',
        already_running: 'warning',
        triggered: 'info',
    };
    return <Badge bg={map[status] ?? 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
};

const ttlPercent = (ttlSeconds?: number) => {
    if (!ttlSeconds || ttlSeconds <= 0) return 0;
    return Math.max(0, Math.min(100, (ttlSeconds / (24 * 3600)) * 100));
};

const ttlVariant = (pct: number) => {
    if (pct > 75) return 'success';
    if (pct > 50) return 'warning';
    if (pct > 25) return 'info';
    return 'danger';
};

const fmtTime = (ts?: string) => {
    if (!ts) return 'N/A';
    try { return new Date(ts).toLocaleString(); } catch { return ts; }
};

const CacheMonitor: React.FC = () => {
    const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
    const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
    const [cacheLoading, setCacheLoading] = useState(false);
    const [batchLoading, setBatchLoading] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchCacheStatus = async () => {
        setCacheLoading(true);
        try {
            const resp = await api.get(API_ENDPOINTS.ADMIN_CACHE_STATUS);
            const data = (resp as any).cache_status ?? (resp.data as any)?.cache_status;
            if (data) {
                setCacheStatus(data);
                setLastUpdated(new Date());
            }
        } catch {
            // non-fatal
        } finally {
            setCacheLoading(false);
        }
    };

    const fetchBatchStatus = async () => {
        setBatchLoading(true);
        try {
            const resp = await api.get(API_ENDPOINTS.BATCH_STATUS);
            const data = (resp.data as any) ?? resp;
            if (data && data.status) setBatchStatus(data);
        } catch {
            // non-fatal
        } finally {
            setBatchLoading(false);
        }
    };

    const triggerBatch = async () => {
        setTriggering(true);
        setError('');
        setSuccess('');
        try {
            const resp = await api.post(API_ENDPOINTS.BATCH_TRIGGER, {});
            const data = (resp.data as any) ?? resp;
            if (data?.status === 'triggered') {
                setSuccess('Batch job triggered. Fetching ~500 tickers + flushing screener cache. Takes ~2 min.');
                setTimeout(fetchBatchStatus, 3000);
            } else if (data?.status === 'already_running') {
                setError('Batch already running — wait for it to finish.');
            } else {
                setError('Unexpected response from batch trigger.');
            }
        } catch (e: any) {
            setError(`Batch trigger failed: ${e?.message ?? 'unknown error'}`);
        } finally {
            setTriggering(false);
        }
    };

    const forceRefreshCache = async () => {
        setRefreshing(true);
        setError('');
        setSuccess('');
        try {
            const resp = await api.post(API_ENDPOINTS.ADMIN_CACHE_REFRESH, {});
            if (resp.success) {
                setSuccess('Screener strength cache flushed — next request recomputes from FMP data.');
                await fetchCacheStatus();
            } else {
                setError('Cache refresh failed.');
            }
        } catch (e: any) {
            setError(`Cache refresh failed: ${e?.message ?? 'unknown error'}`);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCacheStatus();
        fetchBatchStatus();
        const iv = setInterval(() => {
            fetchCacheStatus();
            fetchBatchStatus();
        }, 30000);
        return () => clearInterval(iv);
    }, []);

    const pct = ttlPercent(cacheStatus?.ttl_seconds);

    return (
        <Container fluid className="py-4">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h2 className="mb-1">Admin Dashboard</h2>
                    <p className="text-muted mb-0">Cache management and batch job controls</p>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => { fetchCacheStatus(); fetchBatchStatus(); }}
                        disabled={cacheLoading || batchLoading}
                    >
                        {(cacheLoading || batchLoading) ? <Spinner animation="border" size="sm" /> : '↻ Refresh'}
                    </Button>
                    {lastUpdated && (
                        <small className="text-muted ms-2">Updated {lastUpdated.toLocaleTimeString()}</small>
                    )}
                </Col>
            </Row>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Row className="g-4">
                {/* Screener cache card */}
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>Screener Cache</strong>
                            {cacheStatus ? statusBadge(cacheStatus.status) : <Spinner animation="border" size="sm" />}
                        </Card.Header>
                        <Card.Body>
                            {cacheStatus ? (
                                <>
                                    <Row className="mb-3 text-center">
                                        <Col>
                                            <div className="fs-4 fw-bold text-primary">{cacheStatus.count ?? '—'}</div>
                                            <small className="text-muted">Stocks cached</small>
                                        </Col>
                                        <Col>
                                            <div className="fs-6 fw-semibold">{cacheStatus.source ?? '—'}</div>
                                            <small className="text-muted">Data source</small>
                                        </Col>
                                        <Col>
                                            <div className="fs-6 fw-semibold">{cacheStatus.ttl_human ?? '—'}</div>
                                            <small className="text-muted">TTL remaining</small>
                                        </Col>
                                    </Row>
                                    {cacheStatus.ttl_seconds != null && (
                                        <>
                                            <ProgressBar now={pct} variant={ttlVariant(pct)} className="mb-1" />
                                            <small className="text-muted">{Math.round(pct)}% of 24h TTL remaining</small>
                                        </>
                                    )}
                                    {cacheStatus.timestamp && (
                                        <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
                                            Cached at: {fmtTime(cacheStatus.timestamp)}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted">Loading cache status…</p>
                            )}
                        </Card.Body>
                        <Card.Footer>
                            <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={forceRefreshCache}
                                disabled={refreshing}
                            >
                                {refreshing ? <><Spinner animation="border" size="sm" className="me-1" />Flushing…</> : '🗑 Flush strength_data cache'}
                            </Button>
                            <small className="text-muted ms-2">Forces screener to recompute on next request</small>
                        </Card.Footer>
                    </Card>
                </Col>

                {/* Batch job card */}
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <strong>Batch Job (Data Refresh)</strong>
                            {batchStatus ? statusBadge(batchStatus.status) : <Spinner animation="border" size="sm" />}
                        </Card.Header>
                        <Card.Body>
                            {batchStatus ? (
                                <>
                                    <Row className="mb-3 text-center">
                                        <Col>
                                            <div className="fs-4 fw-bold text-success">{batchStatus.success ?? '—'}</div>
                                            <small className="text-muted">Tickers fetched</small>
                                        </Col>
                                        <Col>
                                            <div className="fs-4 fw-bold text-danger">{batchStatus.failed ?? '—'}</div>
                                            <small className="text-muted">Failed</small>
                                        </Col>
                                        <Col>
                                            <div className="fs-6 fw-semibold">
                                                {batchStatus.elapsedMs ? `${(batchStatus.elapsedMs / 1000).toFixed(1)}s` : '—'}
                                            </div>
                                            <small className="text-muted">Duration</small>
                                        </Col>
                                    </Row>
                                    {batchStatus.timestamp && (
                                        <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                                            Last run: {fmtTime(batchStatus.timestamp)}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted">Loading batch status…</p>
                            )}
                        </Card.Body>
                        <Card.Footer>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={triggerBatch}
                                disabled={triggering || batchStatus?.status === 'running'}
                            >
                                {triggering ? (
                                    <><Spinner animation="border" size="sm" className="me-1" />Triggering…</>
                                ) : batchStatus?.status === 'running' ? (
                                    <><Spinner animation="border" size="sm" className="me-1" />Running…</>
                                ) : (
                                    '⚡ Run batch now'
                                )}
                            </Button>
                            <small className="text-muted ms-2">
                                Fetches all S&amp;P 500 tickers from FMP, flushes screener cache
                            </small>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Header><strong>What each action does</strong></Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <p className="mb-1"><strong>Flush strength_data cache</strong></p>
                                    <p className="text-muted small">
                                        Deletes all <code>strength_data:*</code> Redis keys. Flask recomputes sector scores
                                        on the next screener request using whatever fundamentals are already in Redis.
                                        Fast — no API calls. Use when scores look stale but fundamentals are fresh.
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <p className="mb-1"><strong>Run batch now</strong></p>
                                    <p className="text-muted small">
                                        Triggers the Spring Boot batch job: fetches fundamentals for all ~500 S&amp;P 500
                                        tickers from Yahoo Finance + SEC EDGAR, writes <code>fundamentals:*</code> keys,
                                        pre-computes chart scores, then flushes <code>strength_data:*</code> so screener
                                        picks up new data. Takes ~2 minutes. Normally runs daily at 4:15 PM ET.
                                    </p>
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
