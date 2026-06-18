import React, { useState } from 'react';
import { Alert, Col, Container, Modal, ProgressBar, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OptimizationResult {
    method: string;
    expectedReturn: number;
    risk: number;
    sharpeRatio: number;
    maxDrawdown: number;
    portfolio: {
        ticker: string;
        weight: number;
        expectedReturn: number;
        risk: number;
    }[];
}

interface AlternativeData {
    newsSentiment: number;
    socialSentiment: number;
    economicIndicators: {
        gdp: number;
        inflation: number;
        interestRate: number;
    };
    marketMood: 'Bullish' | 'Bearish' | 'Neutral';
}

const OPTIMIZATION_METHODS = [
    {
        id: 'mean-variance',
        num: '01',
        name: 'Mean-Variance',
        description: 'Classic Markowitz optimization for maximum Sharpe ratio.',
    },
    {
        id: 'risk-parity',
        num: '02',
        name: 'Risk Parity',
        description: 'Equal risk contribution from each asset in the portfolio.',
    },
    {
        id: 'black-litterman',
        num: '03',
        name: 'Black-Litterman',
        description: 'Incorporates market views and equilibrium returns.',
    },
    {
        id: 'factor-model',
        num: '04',
        name: 'Factor Model',
        description: 'Multi-factor risk model with explicit factor exposure.',
    },
];

const DATA_SOURCES = [
    { label: 'News Sentiment', desc: 'Real-time financial news analysis and scoring.' },
    { label: 'Social Media', desc: 'Twitter, Reddit, StockTwits aggregated sentiment.' },
    { label: 'Economic Indicators', desc: 'GDP, inflation, interest rates, PMI data.' },
    { label: 'Satellite Data', desc: 'Supply chain and facility activity monitoring.' },
];

const RISK_METRICS = [
    { abbr: 'VaR', label: 'Value at Risk' },
    { abbr: 'CVaR', label: 'Conditional VaR' },
    { abbr: 'Sharpe', label: 'Risk-adj. returns' },
    { abbr: 'Max DD', label: 'Maximum drawdown' },
    { abbr: 'Beta', label: 'Market correlation' },
    { abbr: 'Factor', label: 'Factor exposure' },
];

const AdvancedMode: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
    const [alternativeData, setAlternativeData] = useState<AlternativeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOptimizationModal, setShowOptimizationModal] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);

    const handleRunOptimization = async (method: string) => {
        setLoading(true);
        setError('');
        try {
            const mockResults: OptimizationResult[] = [
                {
                    method,
                    expectedReturn: 12.5,
                    risk: 8.2,
                    sharpeRatio: 1.52,
                    maxDrawdown: 5.8,
                    portfolio: [
                        { ticker: 'AAPL',  weight: 0.25, expectedReturn: 15.2, risk: 12.1 },
                        { ticker: 'MSFT',  weight: 0.20, expectedReturn: 13.8, risk: 10.5 },
                        { ticker: 'GOOGL', weight: 0.15, expectedReturn: 16.1, risk: 14.2 },
                        { ticker: 'TSLA',  weight: 0.10, expectedReturn: 22.5, risk: 25.8 },
                        { ticker: 'NVDA',  weight: 0.30, expectedReturn: 18.9, risk: 16.7 },
                    ],
                },
            ];
            setOptimizationResults(mockResults);
            setShowOptimizationModal(true);
        } catch (err) {
            console.error('Error running optimization:', err);
            setError('Failed to run optimization. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadAlternativeData = async () => {
        setLoading(true);
        setError('');
        try {
            const mockData: AlternativeData = {
                newsSentiment: 0.65,
                socialSentiment: 0.72,
                economicIndicators: { gdp: 2.8, inflation: 3.2, interestRate: 5.25 },
                marketMood: 'Bullish',
            };
            setAlternativeData(mockData);
            setShowDataModal(true);
        } catch (err) {
            console.error('Error loading alternative data:', err);
            setError('Failed to load alternative data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (s: number) => s > 0.6 ? 'success' : s > 0.4 ? 'warning' : 'danger';

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'Bullish': return 'var(--gain)';
            case 'Bearish': return 'var(--loss)';
            default: return 'var(--amber)';
        }
    };

    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <p className="text-muted text-center">
                    <Link to="/login">Log in</Link> to access Advanced Mode.
                </p>
            </Container>
        );
    }

    return (
        <Container fluid className="px-0">

            {/* Page Header */}
            <div className="am-page-header">
                <Container>
                    <span className="am-eyebrow">Optimize</span>
                    <h1 className="am-headline">
                        Professional-grade<br /><em>edge.</em>
                    </h1>
                    <p className="am-sub">
                        Quantitative portfolio optimization algorithms used by institutional
                        investors — now accessible to everyone.
                    </p>
                </Container>
            </div>

            {/* Optimization Methods */}
            <div className="am-section">
                <Container>
                    <span className="am-section-label">Portfolio optimization algorithms</span>
                    <Row className="g-4 mb-4">
                        {OPTIMIZATION_METHODS.map((method) => (
                            <Col lg={6} key={method.id}>
                                <div className="am-opt-card">
                                    <span className="am-opt-num">{method.num}</span>
                                    <h3 className="am-opt-name">{method.name}</h3>
                                    <p className="am-opt-desc">{method.description}</p>
                                    <button
                                        className="am-opt-btn"
                                        onClick={() => handleRunOptimization(method.id)}
                                        disabled={loading}
                                    >
                                        {loading ? 'Optimizing…' : 'Run optimization →'}
                                    </button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    <div className="d-flex gap-3 flex-wrap">
                        <Link to="/advanced-portfolio" className="sn-btn-primary">Full portfolio optimizer</Link>
                        <Link to="/ai-analysis" className="sn-btn-ghost">AI analysis tools</Link>
                        <Link to="/beginner-mode" className="sn-btn-ghost">Switch to Beginner</Link>
                    </div>
                </Container>
            </div>

            {/* Alternative Data */}
            <div className="am-section">
                <Container>
                    <span className="am-section-label">Alternative data sources</span>
                    <div className="am-data-grid">
                        {DATA_SOURCES.map(({ label, desc }) => (
                            <div key={label} className="am-data-item">
                                <div className="am-data-label">{label}</div>
                                <p className="am-data-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                    <button
                        className="am-opt-btn"
                        style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
                        onClick={handleLoadAlternativeData}
                        disabled={loading}
                    >
                        {loading ? 'Loading…' : 'Load live data →'}
                    </button>
                </Container>
            </div>

            {/* Risk Metrics */}
            <div className="am-section" style={{ borderBottom: 'none' }}>
                <Container>
                    <span className="am-section-label">Professional risk metrics</span>
                    <div className="am-risk-grid">
                        {RISK_METRICS.map(({ abbr, label }) => (
                            <div key={abbr} className="am-risk-item">
                                <span className="am-risk-abbr">{abbr}</span>
                                <p className="am-risk-label">{label}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>

            {error && (
                <Container className="pt-3">
                    <Alert variant="danger">{error}</Alert>
                </Container>
            )}

            {/* Optimization Results Modal */}
            <Modal show={showOptimizationModal} onHide={() => setShowOptimizationModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Optimization Results</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {optimizationResults.map((result, i) => (
                        <div key={i}>
                            <Row className="g-3 mb-4">
                                {[
                                    { label: 'Expected Return', value: `${result.expectedReturn}%`, color: 'var(--gain)' },
                                    { label: 'Risk (Volatility)', value: `${result.risk}%`, color: 'var(--amber)' },
                                    { label: 'Sharpe Ratio', value: `${result.sharpeRatio}`, color: 'var(--electric-light)' },
                                    { label: 'Max Drawdown', value: `${result.maxDrawdown}%`, color: 'var(--loss)' },
                                ].map(({ label, value, color }) => (
                                    <Col md={3} key={label}>
                                        <div style={{ background: 'var(--ink-600)', border: '1px solid var(--ink-500)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', color, marginBottom: '0.25rem' }}>{value}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: '0.75rem' }}>
                                Optimized Allocation
                            </p>
                            <Table hover size="sm">
                                <thead>
                                    <tr>
                                        <th>Ticker</th>
                                        <th>Weight</th>
                                        <th>Exp. Return</th>
                                        <th>Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.portfolio.map((stock, si) => (
                                        <tr key={si}>
                                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{stock.ticker}</td>
                                            <td style={{ color: 'var(--algo-light)' }}>{(stock.weight * 100).toFixed(1)}%</td>
                                            <td style={{ color: 'var(--gain)' }}>{stock.expectedReturn.toFixed(1)}%</td>
                                            <td style={{ color: 'var(--amber)' }}>{stock.risk.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        style={{ background: 'transparent', border: '1px solid var(--ink-500)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--ink-300)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.875rem' }}
                        onClick={() => setShowOptimizationModal(false)}
                    >
                        Close
                    </button>
                    <button className="am-opt-btn" style={{ width: 'auto', padding: '0.5rem 1.25rem' }}>
                        Save portfolio →
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Alternative Data Modal */}
            <Modal show={showDataModal} onHide={() => setShowDataModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Alternative Data Insights</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {alternativeData && (
                        <>
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <div style={{ background: 'var(--ink-600)', border: '1px solid var(--ink-500)', borderRadius: 8, padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-400)', marginBottom: '0.75rem' }}>News Sentiment</div>
                                        <ProgressBar now={alternativeData.newsSentiment * 100} variant={getSentimentColor(alternativeData.newsSentiment)} style={{ height: 8 }} />
                                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--ink-200)', marginTop: '0.5rem' }}>
                                            {(alternativeData.newsSentiment * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div style={{ background: 'var(--ink-600)', border: '1px solid var(--ink-500)', borderRadius: 8, padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-400)', marginBottom: '0.75rem' }}>Social Sentiment</div>
                                        <ProgressBar now={alternativeData.socialSentiment * 100} variant={getSentimentColor(alternativeData.socialSentiment)} style={{ height: 8 }} />
                                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--ink-200)', marginTop: '0.5rem' }}>
                                            {(alternativeData.socialSentiment * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: '1rem' }}>
                                Economic Indicators
                            </p>
                            <Row className="g-3 mb-4">
                                {[
                                    { label: 'GDP Growth', value: `${alternativeData.economicIndicators.gdp}%`, color: 'var(--gain)' },
                                    { label: 'Inflation', value: `${alternativeData.economicIndicators.inflation}%`, color: 'var(--amber)' },
                                    { label: 'Interest Rate', value: `${alternativeData.economicIndicators.interestRate}%`, color: 'var(--electric-light)' },
                                ].map(({ label, value, color }) => (
                                    <Col md={4} key={label}>
                                        <div style={{ background: 'var(--ink-600)', border: '1px solid var(--ink-500)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.35rem', color, marginBottom: '0.25rem' }}>{value}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--ink-400)' }}>{label}</div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: getMoodColor(alternativeData.marketMood), background: 'var(--ink-600)', border: `1px solid ${getMoodColor(alternativeData.marketMood)}`, borderRadius: 6, padding: '0.4rem 1rem', letterSpacing: '0.05em' }}>
                                    {alternativeData.marketMood.toUpperCase()}
                                </span>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        style={{ background: 'transparent', border: '1px solid var(--ink-500)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--ink-300)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.875rem' }}
                        onClick={() => setShowDataModal(false)}
                    >
                        Close
                    </button>
                    <button className="am-opt-btn" style={{ width: 'auto', padding: '0.5rem 1.25rem' }}>
                        Generate insights →
                    </button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdvancedMode;
