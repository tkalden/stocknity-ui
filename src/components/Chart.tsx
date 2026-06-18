import React, { useEffect, useRef, useState } from 'react';
import { Badge, Card, Col, Container, Nav, Row, Table } from 'react-bootstrap';
import { API_ENDPOINTS } from '../config/api';
import { apiClient } from '../utils/api';
import { usePriceWebSocket } from '../hooks/usePriceWebSocket';
import { ChartData, ChartResponse } from '../types';

function isMarketOpen(): boolean {
    const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = et.getDay();
    if (day === 0 || day === 6) return false;
    const mins = et.getHours() * 60 + et.getMinutes();
    return mins >= 570 && mins < 960;
}

const Chart: React.FC = () => {
    const [activeTab, setActiveTab] = useState('value');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const { prices, lastUpdated, connected } = usePriceWebSocket();

    // Track previous prices to determine up/down flash
    const prevPricesRef = useRef<Record<string, number>>({});

    const handleChartView = async (chartType: string) => {
        setLoading(true);
        setError('');
        setActiveTab(chartType);

        try {
            const response = await apiClient.get<ChartResponse>(
                API_ENDPOINTS.CHART(chartType)
            );

            if (Array.isArray(response.data?.data)) {
                setChartData(response.data.data);
            } else {
                setError(`No data available for ${chartType} chart.`);
            }
        } catch (err: any) {
            setError(`Failed to load ${chartType} chart: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleChartView('value');
    }, []);

    // Update prev prices after render
    useEffect(() => {
        prevPricesRef.current = { ...prices };
    });

    const formatValue = (value: number | string) => {
        const n = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(n) ? '0.00' : n.toFixed(2);
    };

    const getValueColor = (value: number | string) => {
        const n = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(n)) return 'text-muted';
        return n > 0 ? 'text-success' : n < 0 ? 'text-danger' : 'text-muted';
    };

    const getPriceFlashStyle = (ticker: string): React.CSSProperties => {
        const current = prices[ticker];
        const prev = prevPricesRef.current[ticker];
        const updatedAt = lastUpdated[ticker];
        const isRecent = updatedAt && Date.now() - updatedAt < 1500;

        if (!current || !prev || !isRecent) return {};
        if (current > prev) return { backgroundColor: 'rgba(25, 135, 84, 0.25)', transition: 'background-color 0.3s' };
        if (current < prev) return { backgroundColor: 'rgba(220, 53, 69, 0.25)', transition: 'background-color 0.3s' };
        return {};
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card>
                        <Card.Header as="h4" className="d-flex justify-content-between align-items-center">
                            Market Analysis Charts
                            <Badge bg={connected ? 'success' : 'secondary'} style={{ fontSize: '0.75rem' }}>
                                {connected ? '● Live' : '○ Offline'}
                            </Badge>
                        </Card.Header>
                        <Card.Body>
                            <Nav variant="tabs" className="mb-3">
                                {['value', 'growth', 'dividend'].map(tab => (
                                    <Nav.Item key={tab}>
                                        <Nav.Link active={activeTab === tab} onClick={() => handleChartView(tab)}>
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Stocks
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>

                            {error && (
                                <div className="alert alert-danger">
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border" role="status" />
                                    <p className="mt-2">Loading chart data...</p>
                                </div>
                            ) : chartData.length > 0 ? (
                                <div>
                                    <div className="mb-4">
                                        <h5>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Stocks Analysis</h5>
                                        <p className="text-muted">
                                            {activeTab === 'value' && 'Top 5 value stocks by P/E, P/B, and dividend metrics'}
                                            {activeTab === 'growth' && 'Top 5 growth stocks by sales growth, PEG, and forward P/E'}
                                            {activeTab === 'dividend' && 'Top 5 dividend stocks by yield percentage'}
                                        </p>
                                    </div>

                                    {chartData.map((sector, sectorIdx) => (
                                        <Card key={sectorIdx} className="mb-4">
                                            <Card.Header>
                                                <h6 className="mb-0">
                                                    {sector.title}
                                                    <Badge bg="info" className="ms-2">{sector.labels.length} stocks</Badge>
                                                </h6>
                                            </Card.Header>
                                            <Card.Body>
                                                <Table striped bordered hover size="sm" className="table-responsive">
                                                    <thead>
                                                        <tr>
                                                            <th>Rank</th>
                                                            <th>Ticker</th>
                                                            <th>
                                                                {activeTab === 'value' && 'Value Score'}
                                                                {activeTab === 'growth' && 'Growth Score'}
                                                                {activeTab === 'dividend' && 'Dividend Yield (%)'}
                                                            </th>
                                                            <th>Performance</th>
                                                            <th>Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sector.labels.map((ticker, i) => {
                                                            const livePrice = prices[ticker];
                                                            return (
                                                                <tr key={i} style={getPriceFlashStyle(ticker)}>
                                                                    <td>
                                                                        <Badge bg={i === 0 ? 'warning' : 'secondary'}>
                                                                            #{i + 1}
                                                                        </Badge>
                                                                    </td>
                                                                    <td><strong>{ticker}</strong></td>
                                                                    <td>
                                                                        <span className={getValueColor(sector.values[i])}>
                                                                            {formatValue(sector.values[i])}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <div className="progress" style={{ height: '20px' }}>
                                                                            {(() => {
                                                                                const n = sector.values[i];
                                                                                return (
                                                                                    <div
                                                                                        className={`progress-bar ${n > 0 ? 'bg-success' : 'bg-danger'}`}
                                                                                        role="progressbar"
                                                                                        style={{ width: `${Math.min(Math.abs(n) * 10, 100)}%`, minWidth: '20px' }}
                                                                                    >
                                                                                        {formatValue(sector.values[i])}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ minWidth: '110px', fontFamily: 'monospace' }}>
                                                                        {isMarketOpen() && livePrice != null ? (
                                                                            <span className="fw-bold text-success">
                                                                                ${livePrice.toFixed(2)}
                                                                                <span style={{ fontSize: '0.65rem', marginLeft: 4 }} className="text-success">●</span>
                                                                            </span>
                                                                        ) : sector.prices?.[ticker] != null ? (
                                                                            <span className="text-muted">
                                                                                ${sector.prices![ticker].toFixed(2)}
                                                                                <span style={{ fontSize: '0.65rem', marginLeft: 4 }}>close</span>
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-muted">—</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </Table>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <h5>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Stocks Analysis</h5>
                                    <p className="text-muted">No chart data available.</p>
                                    <button className="btn btn-primary" onClick={() => handleChartView(activeTab)}>
                                        Retry
                                    </button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Chart;
