import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { API_BASE_URL, API_ENDPOINTS, sectors } from '../config/api';
import { StockData } from '../types';

type SortKey = keyof StockData;
type SortDir = 'asc' | 'desc';

const Screener: React.FC = () => {
    const [sector, setSector] = useState('Any');
    const [stockData, setStockData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('ticker');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    useEffect(() => {
        fetchStockData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchStockData = async () => {
        setLoading(true);
        setError('');
        try {
            const params: Record<string, string> = {};
            if (sector !== 'Any') params.sector = sector;

            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SCREENER_DATA}`, { params });
            if (response.data?.data) {
                setStockData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching stock data:', err);
            setError('Failed to load stock data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchStockData();
    };

    const fmt = (v: number | null | undefined, decimals = 2, suffix = '') => {
        if (v == null || isNaN(v)) return '—';
        return v.toFixed(decimals) + suffix;
    };

    const changeColor = (v: number) => (v >= 0 ? 'text-success' : 'text-danger');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const sortedData = [...stockData].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        let cmp = 0;
        if (typeof av === 'string' && typeof bv === 'string') {
            cmp = av.localeCompare(bv);
        } else if (typeof av === 'boolean' && typeof bv === 'boolean') {
            cmp = (av ? 1 : 0) - (bv ? 1 : 0);
        } else {
            cmp = (av as number) - (bv as number);
        }
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <span style={{ color: 'var(--ink-500)', marginLeft: 4, fontSize: '0.7rem' }}>↕</span>;
        return <span style={{ color: 'var(--electric-light)', marginLeft: 4, fontSize: '0.7rem' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const thStyle: React.CSSProperties = { cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Header as="h4">Stock Screener</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSearch}>
                                <Row className="align-items-end">
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Sector</Form.Label>
                                            <Form.Select
                                                value={sector}
                                                onChange={(e) => setSector(e.target.value)}
                                            >
                                                {sectors.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group className="mb-3">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                disabled={loading}
                                                className="w-100"
                                            >
                                                {loading ? 'Loading…' : 'Search'}
                                            </Button>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card>
                        <Card.Header as="h5">
                            Results ({stockData.length} stocks)
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading…</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive screener-table">
                                    <Table striped hover size="sm">
                                        <thead>
                                            <tr>
                                                <th style={thStyle} onClick={() => handleSort('ticker')}>Ticker <SortIcon col="ticker" /></th>
                                                <th style={thStyle} onClick={() => handleSort('sector')}>Sector <SortIcon col="sector" /></th>
                                                <th style={thStyle} onClick={() => handleSort('price')}>Price <SortIcon col="price" /></th>
                                                <th style={thStyle} onClick={() => handleSort('todayChange')}>Today % <SortIcon col="todayChange" /></th>
                                                <th style={thStyle} onClick={() => handleSort('annualReturn')}>1Y Return <SortIcon col="annualReturn" /></th>
                                                <th style={thStyle} onClick={() => handleSort('dividend')}>Dividend <SortIcon col="dividend" /></th>
                                                <th style={thStyle} onClick={() => handleSort('pe')}>P/E <SortIcon col="pe" /></th>
                                                <th style={thStyle} onClick={() => handleSort('pb')}>P/B <SortIcon col="pb" /></th>
                                                <th style={thStyle} onClick={() => handleSort('isLive')}>Feed <SortIcon col="isLive" /></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedData.map((stock) => (
                                                <tr key={stock.ticker}>
                                                    <td><strong style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{stock.ticker}</strong></td>
                                                    <td>{stock.sector}</td>
                                                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>${fmt(stock.price)}</td>
                                                    <td className={changeColor(stock.todayChange)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                        {fmt(stock.todayChange)}%
                                                    </td>
                                                    <td className={changeColor(stock.annualReturn)} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                        {fmt(stock.annualReturn)}%
                                                    </td>
                                                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmt(stock.dividend)}%</td>
                                                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmt(stock.pe)}</td>
                                                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmt(stock.pb)}</td>
                                                    <td>
                                                        <Badge bg={stock.isLive ? 'success' : 'secondary'} style={{ fontSize: '0.65rem' }}>
                                                            {stock.isLive ? '● Live' : '○ Delayed'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Screener;
