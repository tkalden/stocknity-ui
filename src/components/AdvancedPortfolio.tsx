import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, ProgressBar, Row, Table } from 'react-bootstrap';

interface OptimizationMethod {
    id: string;
    name: string;
    description: string;
    advantages: string[];
    disadvantages: string[];
}

interface PortfolioStock {
    Ticker: string;
    weight: number;
    invested_amount: number;
    total_shares: number;
    price: string;
    expected_annual_return: string;
    expected_annual_risk: string;
    strength: string;
}

interface OptimizationMetrics {
    method: string;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
}

interface ComparisonResult {
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
    method: string;
    top_holdings: Array<{
        ticker: string;
        weight: number;
    }>;
}

interface BacktestResult {
    total_return: number;
    annualized_return: number;
    volatility: number;
    sharpe_ratio: number;
    max_drawdown: number;
    var_95: number;
    cvar_95: number;
    calmar_ratio: number;
    information_ratio: number;
}

const AdvancedPortfolio: React.FC = () => {
    const [optimizationMethods, setOptimizationMethods] = useState<OptimizationMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState('markowitz');
    const [investingAmount, setInvestingAmount] = useState(10000);
    const [maxStockPrice, setMaxStockPrice] = useState(100);
    const [riskTolerance, setRiskTolerance] = useState('Medium');
    const [sector, setSector] = useState('Any');
    const [index, setIndex] = useState('S&P 500');
    const [stockType, setStockType] = useState('Value');

    const [portfolioData, setPortfolioData] = useState<PortfolioStock[]>([]);
    const [optimizationMetrics, setOptimizationMetrics] = useState<OptimizationMetrics | null>(null);
    const [comparisonResults, setComparisonResults] = useState<Record<string, ComparisonResult>>({});
    const [backtestResults, setBacktestResults] = useState<Record<string, BacktestResult>>({});
    const [backtestReport, setBacktestReport] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    const [showBacktestModal, setShowBacktestModal] = useState(false);

    const sectors = ['Any', 'Technology', 'Healthcare', 'Financial', 'Consumer Cyclical', 'Industrials', 'Consumer Defensive', 'Energy', 'Basic Materials', 'Real Estate', 'Communication Services', 'Utilities'];
    const indices = ['S&P 500', 'DJIA'];
    const riskTolerances = ['Low', 'Medium', 'High'];
    const stockTypes = ['Value', 'Growth'];

    useEffect(() => {
        fetchOptimizationMethods();
    }, []);

    const fetchOptimizationMethods = async () => {
        try {
            const response = await axios.get('/portfolio/optimization-methods');
            if (response.data.success) {
                setOptimizationMethods(response.data.methods);
            }
        } catch (error) {
            console.error('Error fetching optimization methods:', error);
        }
    };

    const handleAdvancedOptimization = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/portfolio/advanced', {
                method: selectedMethod,
                investing_amount: investingAmount,
                max_stock_price: maxStockPrice,
                risk_tolerance: riskTolerance,
                sector: sector,
                index: index,
                stock_type: stockType
            });

            if (response.data.success) {
                setPortfolioData(response.data.data);
                setOptimizationMetrics(response.data.metrics);
            } else {
                setError(response.data.error || 'Failed to build portfolio');
            }
        } catch (error) {
            console.error('Error building advanced portfolio:', error);
            setError('Failed to build portfolio. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompareMethods = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/portfolio/compare-methods', {
                investing_amount: investingAmount,
                max_stock_price: maxStockPrice,
                risk_tolerance: riskTolerance,
                sector: sector,
                index: index,
                stock_type: stockType
            });

            if (response.data.success) {
                setComparisonResults(response.data.results);
                setShowComparisonModal(true);
            } else {
                setError(response.data.error || 'Failed to compare methods');
            }
        } catch (error) {
            console.error('Error comparing methods:', error);
            setError('Failed to compare methods. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBacktest = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/portfolio/backtest', {
                investing_amount: investingAmount,
                max_stock_price: maxStockPrice,
                risk_tolerance: riskTolerance,
                sector: sector,
                index: index,
                stock_type: stockType
            });

            if (response.data.success) {
                setBacktestResults(response.data.backtest_results);
                setBacktestReport(response.data.report);
                setShowBacktestModal(true);
            } else {
                setError(response.data.error || 'Failed to run backtest');
            }
        } catch (error) {
            console.error('Error running backtest:', error);
            setError('Failed to run backtest. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatPercentage = (value: number | undefined) => {
        if (value === undefined || value === null) return 'N/A';
        return `${(value * 100).toFixed(2)}%`;
    };
    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return 'N/A';
        return `$${value.toLocaleString()}`;
    };
    const formatNumber = (value: number | undefined) => {
        if (value === undefined || value === null) return 'N/A';
        return value.toFixed(3);
    };

    const getMethodColor = (method: string) => {
        const colors: Record<string, string> = {
            'markowitz': 'primary',
            'risk_parity': 'success',
            'max_sharpe': 'warning',
            'hrp': 'info'
        };
        return colors[method] || 'secondary';
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Header as="h4">
                            Advanced Portfolio Optimization
                            <Button
                                variant="outline-info"
                                size="sm"
                                className="ms-2"
                                onClick={() => setShowMethodModal(true)}
                            >
                                Learn About Methods
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Optimization Method</Form.Label>
                                        <Form.Select
                                            value={selectedMethod}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                        >
                                            {optimizationMethods.map((method) => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Investment Amount ($)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={investingAmount}
                                            onChange={(e) => setInvestingAmount(Number(e.target.value))}
                                            min="1000"
                                            step="1000"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Max Stock Price ($)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={maxStockPrice}
                                            onChange={(e) => setMaxStockPrice(Number(e.target.value))}
                                            min="10"
                                            step="10"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Risk Tolerance</Form.Label>
                                        <Form.Select
                                            value={riskTolerance}
                                            onChange={(e) => setRiskTolerance(e.target.value)}
                                        >
                                            {riskTolerances.map((risk) => (
                                                <option key={risk} value={risk}>{risk}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={3}>
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
                                <Col md={3}>
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
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Stock Type</Form.Label>
                                        <Form.Select
                                            value={stockType}
                                            onChange={(e) => setStockType(e.target.value)}
                                        >
                                            {stockTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3} className="d-flex align-items-end">
                                    <div className="d-grid gap-2 w-100">
                                        <Button
                                            variant="primary"
                                            onClick={handleAdvancedOptimization}
                                            disabled={loading}
                                        >
                                            {loading ? 'Optimizing...' : 'Build Portfolio'}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col>
                                    <Button
                                        variant="outline-success"
                                        onClick={handleCompareMethods}
                                        disabled={loading}
                                        className="me-2"
                                    >
                                        Compare Methods
                                    </Button>
                                    <Button
                                        variant="outline-warning"
                                        onClick={handleBacktest}
                                        disabled={loading}
                                    >
                                        Run Backtest
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {error && <Alert variant="danger">{error}</Alert>}

                    {optimizationMetrics && (
                        <Card className="mb-4">
                            <Card.Header as="h5">
                                Optimization Results - {optimizationMetrics.method?.toUpperCase() || 'Unknown'} Method
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h6>Expected Return</h6>
                                            <h4 className="text-success">
                                                {formatPercentage(optimizationMetrics.expected_return)}
                                            </h4>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h6>Volatility</h6>
                                            <h4 className="text-warning">
                                                {formatPercentage(optimizationMetrics.volatility)}
                                            </h4>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h6>Sharpe Ratio</h6>
                                            <h4 className="text-info">
                                                {formatNumber(optimizationMetrics.sharpe_ratio)}
                                            </h4>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h6>Risk-Adjusted Return</h6>
                                            <h4 className="text-primary">
                                                {optimizationMetrics.expected_return && optimizationMetrics.volatility
                                                    ? formatPercentage(optimizationMetrics.expected_return / optimizationMetrics.volatility)
                                                    : 'N/A'
                                                }
                                            </h4>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {portfolioData.length > 0 && (
                        <Card>
                            <Card.Header as="h5">
                                Optimized Portfolio ({portfolioData.length} stocks)
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive">
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Ticker</th>
                                                <th>Weight</th>
                                                <th>Investment</th>
                                                <th>Shares</th>
                                                <th>Price</th>
                                                <th>Expected Return</th>
                                                <th>Risk</th>
                                                <th>Strength</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {portfolioData.map((stock, index) => (
                                                <tr key={index}>
                                                    <td><strong>{stock.Ticker}</strong></td>
                                                    <td>
                                                        <Badge bg={getMethodColor(selectedMethod)}>
                                                            {formatPercentage(stock.weight)}
                                                        </Badge>
                                                    </td>
                                                    <td>{formatCurrency(stock.invested_amount)}</td>
                                                    <td>{Math.round(stock.total_shares)}</td>
                                                    <td>{formatCurrency(Number(stock.price))}</td>
                                                    <td className="text-success">
                                                        {formatPercentage(Number(stock.expected_annual_return))}
                                                    </td>
                                                    <td className="text-warning">
                                                        {formatPercentage(Number(stock.expected_annual_risk))}
                                                    </td>
                                                    <td>
                                                        <ProgressBar
                                                            now={Number(stock.strength) * 10}
                                                            max={50}
                                                            variant="info"
                                                        />
                                                        <small>{formatNumber(Number(stock.strength))}</small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* Method Information Modal */}
            <Modal show={showMethodModal} onHide={() => setShowMethodModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Optimization Methods</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {optimizationMethods.map((method) => (
                        <Card key={method.id} className="mb-3">
                            <Card.Header>
                                <h6>{method.name}</h6>
                            </Card.Header>
                            <Card.Body>
                                <p>{method.description}</p>
                                <Row>
                                    <Col md={6}>
                                        <h6 className="text-success">Advantages:</h6>
                                        <ul>
                                            {method.advantages.map((adv, idx) => (
                                                <li key={idx}>{adv}</li>
                                            ))}
                                        </ul>
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="text-danger">Disadvantages:</h6>
                                        <ul>
                                            {method.disadvantages.map((dis, idx) => (
                                                <li key={idx}>{dis}</li>
                                            ))}
                                        </ul>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Modal.Body>
            </Modal>

            {/* Method Comparison Modal */}
            <Modal show={showComparisonModal} onHide={() => setShowComparisonModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Method Comparison</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Expected Return</th>
                                <th>Volatility</th>
                                <th>Sharpe Ratio</th>
                                <th>Top Holdings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(comparisonResults).map(([method, result]) => (
                                <tr key={method}>
                                    <td>
                                        <Badge bg={getMethodColor(method)}>
                                            {result.method}
                                        </Badge>
                                    </td>
                                    <td className="text-success">
                                        {formatPercentage(result.expected_return)}
                                    </td>
                                    <td className="text-warning">
                                        {formatPercentage(result.volatility)}
                                    </td>
                                    <td className="text-info">
                                        {formatNumber(result.sharpe_ratio)}
                                    </td>
                                    <td>
                                        {result.top_holdings.map((holding, idx) => (
                                            <Badge key={idx} bg="light" text="dark" className="me-1">
                                                {holding.ticker} ({formatPercentage(holding.weight)})
                                            </Badge>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            {/* Backtest Results Modal */}
            <Modal show={showBacktestModal} onHide={() => setShowBacktestModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Backtesting Results</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Strategy</th>
                                <th>Total Return</th>
                                <th>Annual Return</th>
                                <th>Volatility</th>
                                <th>Sharpe Ratio</th>
                                <th>Max Drawdown</th>
                                <th>VaR (95%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(backtestResults).map(([strategy, result]) => (
                                <tr key={strategy}>
                                    <td><strong>{strategy}</strong></td>
                                    <td className="text-success">
                                        {formatPercentage(result.total_return)}
                                    </td>
                                    <td className="text-success">
                                        {formatPercentage(result.annualized_return)}
                                    </td>
                                    <td className="text-warning">
                                        {formatPercentage(result.volatility)}
                                    </td>
                                    <td className="text-info">
                                        {formatNumber(result.sharpe_ratio)}
                                    </td>
                                    <td className="text-danger">
                                        {formatPercentage(result.max_drawdown)}
                                    </td>
                                    <td className="text-danger">
                                        {formatPercentage(result.var_95)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {backtestReport && (
                        <Card className="mt-3">
                            <Card.Header>Detailed Report</Card.Header>
                            <Card.Body>
                                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
                                    {backtestReport}
                                </pre>
                            </Card.Body>
                        </Card>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default AdvancedPortfolio; 