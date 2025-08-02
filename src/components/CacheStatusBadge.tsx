import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Badge, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';

interface CacheStatus {
    status: string;
    ttl_seconds?: number;
    count?: number;
}

const CacheStatusBadge: React.FC = () => {
    const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchCacheStatus = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await axios.get('/cache/status');
            if (response.data.success) {
                setCacheStatus(response.data.cache_status);
            } else {
                setError(true);
            }
        } catch (error) {
            console.error('Error fetching cache status:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCacheStatus();
        // Refresh every 60 seconds for the badge
        const interval = setInterval(fetchCacheStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-1" />
                <small className="text-light">Cache</small>
            </div>
        );
    }

    if (error || !cacheStatus) {
        const tooltip = (
            <Tooltip id="cache-unknown-tooltip">
                Cache status unavailable
            </Tooltip>
        );

        return (
            <OverlayTrigger placement="bottom" overlay={tooltip}>
                <Badge bg="secondary" className="fs-6">Cache Unknown</Badge>
            </OverlayTrigger>
        );
    }

    const getStatusBadge = () => {
        const ttlPercentage = cacheStatus.ttl_seconds ? (cacheStatus.ttl_seconds / (24 * 60 * 60)) * 100 : 0;

        switch (cacheStatus.status) {
            case 'cached':
                let badge, tooltipText;

                if (ttlPercentage > 50) {
                    badge = <Badge bg="success" className="fs-6">Cache OK</Badge>;
                    tooltipText = `Cache healthy (${Math.round(ttlPercentage)}% TTL remaining, ${cacheStatus.count} stocks)`;
                } else if (ttlPercentage > 25) {
                    badge = <Badge bg="warning" className="fs-6">Cache Aging</Badge>;
                    tooltipText = `Cache aging (${Math.round(ttlPercentage)}% TTL remaining, ${cacheStatus.count} stocks)`;
                } else {
                    badge = <Badge bg="danger" className="fs-6">Cache Expiring</Badge>;
                    tooltipText = `Cache expiring soon (${Math.round(ttlPercentage)}% TTL remaining, ${cacheStatus.count} stocks)`;
                }

                const tooltip = (
                    <Tooltip id="cache-status-tooltip">
                        {tooltipText}
                    </Tooltip>
                );

                return (
                    <OverlayTrigger placement="bottom" overlay={tooltip}>
                        {badge}
                    </OverlayTrigger>
                );

            case 'not_cached':
                const noCacheTooltip = (
                    <Tooltip id="no-cache-tooltip">
                        No cached data available
                    </Tooltip>
                );
                return (
                    <OverlayTrigger placement="bottom" overlay={noCacheTooltip}>
                        <Badge bg="warning" className="fs-6">No Cache</Badge>
                    </OverlayTrigger>
                );

            case 'redis_unavailable':
                const redisTooltip = (
                    <Tooltip id="redis-tooltip">
                        Redis connection unavailable
                    </Tooltip>
                );
                return (
                    <OverlayTrigger placement="bottom" overlay={redisTooltip}>
                        <Badge bg="danger" className="fs-6">Redis Down</Badge>
                    </OverlayTrigger>
                );

            default:
                const unknownTooltip = (
                    <Tooltip id="unknown-tooltip">
                        Unknown cache status
                    </Tooltip>
                );
                return (
                    <OverlayTrigger placement="bottom" overlay={unknownTooltip}>
                        <Badge bg="secondary" className="fs-6">Unknown</Badge>
                    </OverlayTrigger>
                );
        }
    };

    return getStatusBadge();
};

export default CacheStatusBadge; 