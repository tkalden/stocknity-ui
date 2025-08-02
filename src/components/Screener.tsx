import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';

interface StockData {
    Ticker: string;
    Company?: string;
    Sector: string;
    Index: string;
    price: string;
    Change: string;
    Volume: string;
    "Market Cap": string;
    pe: string;
    fpe: string;
    peg: string;
    "Debt/Eq": string;
    ROIC: string;
    roe: string;
    "52W High": string;
    "52W Low": string;
    ATR: string;
    "Avg Volume": string;
    "Change from Open": string;
    "Curr R": string;
    "EPS Next 5Y": string;
    "EPS Next Y": string;
    "EPS Past 5Y": string;
    "EPS This Y": string;
    Earnings: string;
    Float: string;
    Gap: string;
    "Gross M": string;
    "Insider Trans": string;
    "Inst Own": string;
    "Inst Trans": string;
    "LTDebt/Eq": string;
    "Oper M": string;
    Outstanding: string;
    "P/FCF": string;
    "P/S": string;
    "Profit M": string;
    "Quick R": string;
    ROA: string;
    RSI: string;
    SMA20: string;
    SMA200: string;
    SMA50: string;
    "Sales Past 5Y": string;
    "Short Float": string;
    "Short Ratio": string;
    beta: string;
    dividend: string;
    expected_annual_return: string;
    expected_annual_risk: string;
    insider_own: string;
    pb: string;
    pc: string;
    return_risk_ratio: string;
    strength?: string;
}

const Screener: React.FC = () => {
    const [sector, setSector] = useState('Any');
    const [index, setIndex] = useState('S&P 500');
    const [stockData, setStockData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sectors = ['Any', 'Technology', 'Healthcare', 'Financial', 'Consumer Cyclical', 'Industrials', 'Consumer Defensive', 'Energy', 'Basic Materials', 'Real Estate', 'Communication Services', 'Utilities'];
    const indices = ['S&P 500', 'DJIA'];

    useEffect(() => {
        fetchStockData();
    }, []);

    const fetchStockData = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get('/screener/data');
            if (response.data && response.data.data) {
                setStockData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setError('Failed to load stock data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('sector', sector);
            formData.append('index', index);

            await axios.post('/screener', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            // Fetch updated data
            await fetchStockData();
        } catch (error) {
            console.error('Error searching stocks:', error);
            setError('Failed to search stocks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (value: string) => {
        if (!value || value === 'nan') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return num.toLocaleString();
    };

    const formatPercentage = (value: string) => {
        if (!value || value === 'nan') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return `${num.toFixed(2)}%`;
    };

    const formatCurrency = (value: string) => {
        if (!value || value === 'nan') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return `$${num.toFixed(2)}`;
    };

    const formatMarketCap = (value: string) => {
        if (!value || value === 'nan') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toLocaleString()}`;
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Header as="h4">Stock Screener</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSearch}>
                                <Row>
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
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Index</Form.Label>
                                            <Form.Select
                                                value={index}
                                                onChange={(e) => setIndex(e.target.value)}
                                            >
                                                {indices.map((i) => (
                                                    <option key={i} value={i}>{i}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="d-flex align-items-end">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={loading}
                                            className="w-100"
                                        >
                                            {loading ? 'Searching...' : 'Search'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card>
                        <Card.Header as="h5">Stock Data ({stockData.length} stocks)</Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive screener-table">
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Ticker</th>
                                                <th>Sector</th>
                                                <th>Index</th>
                                                <th>Price</th>
                                                <th>Change</th>
                                                <th>Market Cap</th>
                                                <th>P/E</th>
                                                <th>Forward P/E</th>
                                                <th>PEG</th>
                                                <th>Debt/Eq</th>
                                                <th>ROIC</th>
                                                <th>ROE</th>
                                                <th>ROA</th>
                                                <th>Profit M</th>
                                                <th>Oper M</th>
                                                <th>Gross M</th>
                                                <th>Beta</th>
                                                <th>RSI</th>
                                                <th>52W High</th>
                                                <th>52W Low</th>
                                                <th>Volume</th>
                                                <th>Avg Volume</th>
                                                <th>Expected Return</th>
                                                <th>Expected Risk</th>
                                                <th>Return/Risk</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockData.map((stock, index) => (
                                                <tr key={index}>
                                                    <td><strong>{stock.Ticker}</strong></td>
                                                    <td>{stock.Sector}</td>
                                                    <td>{stock.Index}</td>
                                                    <td>{formatCurrency(stock.price)}</td>
                                                    <td className={parseFloat(stock.Change) >= 0 ? 'text-success' : 'text-danger'}>
                                                        {formatPercentage(stock.Change)}
                                                    </td>
                                                    <td>{formatMarketCap(stock["Market Cap"])}</td>
                                                    <td>{formatNumber(stock.pe)}</td>
                                                    <td>{formatNumber(stock.fpe)}</td>
                                                    <td>{formatNumber(stock.peg)}</td>
                                                    <td>{formatNumber(stock["Debt/Eq"])}</td>
                                                    <td>{formatPercentage(stock.ROIC)}</td>
                                                    <td>{formatPercentage(stock.roe)}</td>
                                                    <td>{formatPercentage(stock.ROA)}</td>
                                                    <td>{formatPercentage(stock["Profit M"])}</td>
                                                    <td>{formatPercentage(stock["Oper M"])}</td>
                                                    <td>{formatPercentage(stock["Gross M"])}</td>
                                                    <td>{formatNumber(stock.beta)}</td>
                                                    <td>{formatNumber(stock.RSI)}</td>
                                                    <td>{formatCurrency(stock["52W High"])}</td>
                                                    <td>{formatCurrency(stock["52W Low"])}</td>
                                                    <td>{formatNumber(stock.Volume)}</td>
                                                    <td>{formatNumber(stock["Avg Volume"])}</td>
                                                    <td className="text-success">{formatPercentage(stock.expected_annual_return)}</td>
                                                    <td className="text-warning">{formatPercentage(stock.expected_annual_risk)}</td>
                                                    <td className="text-info">{formatNumber(stock.return_risk_ratio)}</td>
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