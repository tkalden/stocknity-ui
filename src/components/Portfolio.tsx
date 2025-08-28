import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { API_ENDPOINTS, indices, riskTolerances, sectors, stockTypes } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { PortfolioData, PortfolioStock } from '../types';
import styles from './Portfolio.module.css';



const Portfolio: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [portfolios, setPortfolios] = useState<PortfolioData[]>([]);
    const [currentPortfolio, setCurrentPortfolio] = useState<PortfolioStock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showTopStockModal, setShowTopStockModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Top Stock Modal State
    const [topStockForm, setTopStockForm] = useState({
        sector: 'Any',
        index: 'S&P 500',
        stock_type: 'Value',
        investing_amount: '10000',
        max_stock_price: '100',
        risk_tolerance: 'Medium'
    });

    // Custom Portfolio Modal State
    const [customForm, setCustomForm] = useState({
        stock_type: 'Value',
        expected_return_value: '10',
        investing_amount: '10000',
        risk_tolerance: 'Medium',
        selected_stocks: [] as string[]
    });


    useEffect(() => {
        if (isAuthenticated) {
            fetchPortfolios();
            fetchCurrentPortfolio();
        }
    }, [isAuthenticated]);

    const fetchPortfolios = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.MY_PORTFOLIO_DATA);
            if (response.data && response.data.data) {
                setPortfolios(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching portfolios:', error);
        }
    };

    const fetchCurrentPortfolio = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.PORTFOLIO_DATA);
            if (response.data && response.data.data) {
                setCurrentPortfolio(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching current portfolio:', error);
        }
    };

    const handleBuildTopStock = async () => {
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('btn', 'Build');
            Object.entries(topStockForm).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await axios.post(API_ENDPOINTS.PORTFOLIO, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data && response.data.data) {
                setCurrentPortfolio(response.data.data);
                setShowTopStockModal(false);
            }
        } catch (error) {
            console.error('Error building top stock portfolio:', error);
            setError('Failed to build portfolio. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptimizeCustom = async () => {
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('btn', 'Optimize');
            Object.entries(customForm).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => formData.append('stock[]', v));
                } else {
                    formData.append(key, value);
                }
            });

            const response = await axios.post(API_ENDPOINTS.PORTFOLIO, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data && response.data.data) {
                setCurrentPortfolio(response.data.data);
                setShowCustomModal(false);
            }
        } catch (error) {
            console.error('Error optimizing custom portfolio:', error);
            setError('Failed to optimize portfolio. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePortfolio = async () => {
        if (currentPortfolio.length === 0) {
            setError('No portfolio to save. Please build or optimize a portfolio first.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('btn', 'Save Portfolio');

            const response = await axios.post(API_ENDPOINTS.PORTFOLIO, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data && response.data.success) {
                await fetchPortfolios();
                setCurrentPortfolio([]);
                alert('Portfolio saved successfully!');
            } else {
                setError('Failed to save portfolio. Please try again.');
            }
        } catch (error) {
            console.error('Error saving portfolio:', error);
            setError('Failed to save portfolio. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePortfolio = async (portfolioId: string) => {
        if (!window.confirm('Are you sure you want to delete this portfolio?')) {
            return;
        }

        try {
            await axios.post(API_ENDPOINTS.DELETE_PORTFOLIO(portfolioId));
            await fetchPortfolios();
            alert('Portfolio deleted successfully!');
        } catch (error) {
            console.error('Error deleting portfolio:', error);
            alert('Failed to delete portfolio. Please try again.');
        }
    };

    const formatNumber = (value: number) => {
        return value;
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    const calculatePortfolioStats = (portfolio: PortfolioStock[]) => {
        if (portfolio.length === 0) return { return: 0, risk: 0, totalValue: 0 };

        const totalReturn = portfolio.reduce((sum, stock) =>
            sum + stock.weighted_expected_return, 0);
        const totalRisk = portfolio.reduce((sum, stock) =>
            sum + stock.expected_annual_risk * stock.weight, 0);
        const totalValue = portfolio.reduce((sum, stock) =>
            sum + stock.invested_amount, 0);

        return {
            return: totalReturn * 100,
            risk: totalRisk * 100,
            totalValue
        };
    };

    if (!isAuthenticated) {
        return (
            <Container>
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="mt-5">
                            <Card.Body className="text-center">
                                <h4>Please log in to access portfolio management</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid>
            {/* Portfolio Actions */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header as="h4">Portfolio Actions</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={4}>
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowTopStockModal(true)}
                                        className="w-100 mb-2"
                                    >
                                        Build Top Stock Portfolio
                                    </Button>
                                </Col>
                                <Col md={4}>
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => setShowCustomModal(true)}
                                        className="w-100 mb-2"
                                    >
                                        Build Custom Portfolio
                                    </Button>
                                </Col>
                                <Col md={4}>
                                    <Button
                                        variant="success"
                                        onClick={handleSavePortfolio}
                                        disabled={saving || currentPortfolio.length === 0}
                                        className="w-100 mb-2"
                                    >
                                        {saving ? 'Saving...' : 'Save Portfolio'}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Current Portfolio */}
            {currentPortfolio.length > 0 && (
                <Row className="mb-4">
                    <Col>
                        <Card>
                            <Card.Header as="h5">
                                Current Portfolio
                                <Badge bg="info" className="ms-2">
                                    {currentPortfolio.length} stocks
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                {(() => {
                                    const stats = calculatePortfolioStats(currentPortfolio);
                                    return (
                                        <div className="mb-3">
                                            <strong>Portfolio Return: {stats.return.toFixed(2)}% | </strong>
                                            <strong>Portfolio Risk: {stats.risk.toFixed(2)}% | </strong>
                                            <strong>Total Value: ${stats.totalValue.toLocaleString()}</strong>
                                        </div>
                                    );
                                })()}
                                <div className="table-responsive portfolio-table">
                                    <Table striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Ticker</th>
                                                <th>Company</th>
                                                <th>Weight</th>
                                                <th>Invested Amount</th>
                                                <th>Shares</th>
                                                <th>Expected Return</th>
                                                <th>Risk</th>
                                                <th>Strength</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentPortfolio.map((stock, index) => (
                                                <tr key={index}>
                                                    <td><strong>{stock.Ticker}</strong></td>
                                                    <td>{stock.Company}</td>
                                                    <td className="text-primary">{formatPercentage(stock.weight)}</td>
                                                    <td className="text-success">${formatNumber(stock.invested_amount)}</td>
                                                    <td>{formatNumber(stock.total_shares)}</td>
                                                    <td className="text-success">{formatPercentage(stock.expected_annual_return)}</td>
                                                    <td className="text-warning">{formatPercentage(stock.expected_annual_risk)}</td>
                                                    <td className="text-info">{formatNumber(stock.strength)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Saved Portfolios */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header as="h5">Saved Portfolios</Card.Header>
                        <Card.Body>
                            {portfolios.length === 0 ? (
                                <p className="text-muted">No saved portfolios yet.</p>
                            ) : (
                                portfolios.map((portfolio, index) => (
                                    <Card key={index} className="mb-3">
                                        <Card.Header>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Portfolio {index + 1} - {portfolio.data && portfolio.data.length > 0 ? portfolio.data[0]?.created_at : 'Unknown date'}</span>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeletePortfolio(portfolio.portfolio_id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </Card.Header>
                                        <Card.Body>
                                            {(() => {
                                                const stats = calculatePortfolioStats(portfolio.data || []);
                                                return (
                                                    <div className="mb-3">
                                                        <strong>Portfolio Return: {stats.return.toFixed(2)}% | </strong>
                                                        <strong>Portfolio Risk: {stats.risk.toFixed(2)}% | </strong>
                                                        <strong>Total Value: ${stats.totalValue.toLocaleString()}</strong>
                                                    </div>
                                                );
                                            })()}
                                            <div className="table-responsive">
                                                <Table striped bordered hover size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Ticker</th>
                                                            <th>Company</th>
                                                            <th>Weight</th>
                                                            <th>Invested Amount</th>
                                                            <th>Expected Return</th>
                                                            <th>Risk</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(portfolio.data || []).map((stock, stockIndex) => (
                                                            <tr key={stockIndex}>
                                                                <td><strong>{stock.Ticker}</strong></td>
                                                                <td>{stock.Company}</td>
                                                                <td>{formatPercentage(stock.weight)}</td>
                                                                <td>${formatNumber(stock.invested_amount)}</td>
                                                                <td>{formatPercentage(stock.expected_annual_return)}</td>
                                                                <td>{formatPercentage(stock.expected_annual_risk)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Top Stock Portfolio Modal */}
            <Modal show={showTopStockModal} onHide={() => setShowTopStockModal(false)} size="lg">
                <Modal.Header closeButton className={styles.modalHeader}>
                    <Modal.Title className={`text-primary ${styles.modalTitle}`}>
                        <i className="fas fa-chart-line me-2"></i>
                        Build Top Stock Portfolio
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <Form>
                        <div className="mb-4">
                            <h6 className="text-muted mb-3">
                                <i className="fas fa-info-circle me-2"></i>
                                Configure your portfolio parameters
                            </h6>
                        </div>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark">
                                        <i className="fas fa-industry me-1"></i>
                                        Sector
                                    </Form.Label>
                                    <Form.Select
                                        value={topStockForm.sector}
                                        onChange={(e) => setTopStockForm({ ...topStockForm, sector: e.target.value })}
                                    >
                                        {sectors.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark">
                                        <i className="fas fa-chart-bar me-1"></i>
                                        Index
                                    </Form.Label>
                                    <Form.Select
                                        value={topStockForm.index}
                                        onChange={(e) => setTopStockForm({ ...topStockForm, index: e.target.value })}
                                    >
                                        {indices.map((i) => (
                                            <option key={i} value={i}>{i}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark">
                                        <i className="fas fa-tag me-1"></i>
                                        Stock Type
                                    </Form.Label>
                                    <Form.Select
                                        value={topStockForm.stock_type}
                                        onChange={(e) => setTopStockForm({ ...topStockForm, stock_type: e.target.value })}
                                    >
                                        {stockTypes.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold text-dark">
                                        <i className="fas fa-shield-alt me-1"></i>
                                        Risk Tolerance
                                    </Form.Label>
                                    <Form.Select
                                        value={topStockForm.risk_tolerance}
                                        onChange={(e) => setTopStockForm({ ...topStockForm, risk_tolerance: e.target.value })}
                                    >
                                        {riskTolerances.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Investment Amount ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={topStockForm.investing_amount}
                                        onChange={(e) => setTopStockForm({ ...topStockForm, investing_amount: e.target.value })}
                                        min="1000"
                                        step="1000"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Maximum Stock Price ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={topStockForm.max_stock_price}
                                        onChange={(e) => setTopStockForm({ ...topStockForm, max_stock_price: e.target.value })}
                                        min="1"
                                        step="1"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className={styles.modalFooter}>
                    <Button
                        className={`${styles.btnOutline} ${styles.btnSecondary}`}
                        onClick={() => setShowTopStockModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={`${styles.btnPrimary} ms-2`}
                        onClick={handleBuildTopStock}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Building...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-chart-line me-2"></i>
                                Build Portfolio
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Custom Portfolio Modal */}
            <Modal show={showCustomModal} onHide={() => setShowCustomModal(false)} size="lg">
                <Modal.Header closeButton className={styles.modalHeader}>
                    <Modal.Title className={`text-info ${styles.modalTitle}`}>
                        <i className="fas fa-cogs me-2"></i>
                        Build Custom Portfolio
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <Form>
                        <div className="mb-4">
                            <h6 className="text-muted mb-3">
                                <i className="fas fa-info-circle me-2"></i>
                                Configure your custom portfolio
                            </h6>
                        </div>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock Type</Form.Label>
                                    <Form.Select
                                        value={customForm.stock_type}
                                        onChange={(e) => setCustomForm({ ...customForm, stock_type: e.target.value })}
                                    >
                                        {stockTypes.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Risk Tolerance</Form.Label>
                                    <Form.Select
                                        value={customForm.risk_tolerance}
                                        onChange={(e) => setCustomForm({ ...customForm, risk_tolerance: e.target.value })}
                                    >
                                        {riskTolerances.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Expected Return (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={customForm.expected_return_value}
                                        onChange={(e) => setCustomForm({ ...customForm, expected_return_value: e.target.value })}
                                        min="1"
                                        max="50"
                                        step="0.1"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Investment Amount ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={customForm.investing_amount}
                                        onChange={(e) => setCustomForm({ ...customForm, investing_amount: e.target.value })}
                                        min="1000"
                                        step="1000"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Stocks (comma-separated tickers)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g., AAPL, MSFT, GOOGL"
                                onChange={(e) => setCustomForm({
                                    ...customForm,
                                    selected_stocks: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className={styles.modalFooter}>
                    <Button
                        className={`${styles.btnOutline} ${styles.btnSecondary}`}
                        onClick={() => setShowCustomModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={`${styles.btnInfo} ms-2`}
                        onClick={handleOptimizeCustom}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Optimizing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-cogs me-2"></i>
                                Optimize Portfolio
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Portfolio; 