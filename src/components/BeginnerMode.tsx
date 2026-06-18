import React, { useState } from 'react';
import { Alert, Badge, Col, Container, Modal, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface GuruStrategy {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    principles: string[];
    exampleStocks: string[];
}

interface StockRecommendation {
    ticker: string;
    name: string;
    price: number;
    guruRating: number;
    reasoning: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    expectedReturn: number;
}

const guruStrategies: GuruStrategy[] = [
    {
        id: 'buffett',
        name: 'Warren Buffett',
        description: 'Value investing with focus on economic moats and long-term holding.',
        icon: 'fas fa-university',
        color: 'success',
        principles: [
            'Companies with strong economic moats',
            'Intrinsic value vs market price',
            'Long-term horizon (10+ years)',
        ],
        exampleStocks: ['BRK.B', 'AAPL', 'KO', 'AXP', 'BAC'],
    },
    {
        id: 'lynch',
        name: 'Peter Lynch',
        description: 'Growth at reasonable price — invest in what you understand.',
        icon: 'fas fa-chart-line',
        color: 'info',
        principles: [
            'PEG ratio below 1.0',
            'Six stock categories framework',
            'Invest in familiar businesses',
        ],
        exampleStocks: ['MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'],
    },
    {
        id: 'graham',
        name: 'Benjamin Graham',
        description: 'Defensive investing with a margin of safety — capital preservation first.',
        icon: 'fas fa-shield-alt',
        color: 'primary',
        principles: [
            'Buy below intrinsic value',
            '50% margin of safety',
            'Diversify across 20–30 stocks',
        ],
        exampleStocks: ['JNJ', 'PG', 'KO', 'MCD', 'WMT'],
    },
    {
        id: 'dalio',
        name: 'Ray Dalio',
        description: 'All-weather portfolio with risk parity — balanced for any economic cycle.',
        icon: 'fas fa-balance-scale',
        color: 'warning',
        principles: [
            'Diversify across asset classes',
            'Equal risk contribution per asset',
            'Prepared for all economic seasons',
        ],
        exampleStocks: ['SPY', 'TLT', 'GLD', 'VNQ', 'DJP'],
    },
];

const GUARDRAILS = [
    { label: 'Risk Warnings', desc: 'Alerts for high-volatility stocks before you buy.' },
    { label: 'Diversification', desc: 'Prevents over-concentration in single positions.' },
    { label: 'Position Limits', desc: 'Controls maximum exposure per stock.' },
    { label: 'Emergency Stops', desc: 'Automatic protection during market crashes.' },
];

const BeginnerMode: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [selectedStrategy, setSelectedStrategy] = useState<GuruStrategy | null>(null);
    const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

    const handleStrategySelect = (strategy: GuruStrategy) => {
        setSelectedStrategy(strategy);
        setShowStrategyModal(true);
    };

    const handleGetRecommendations = async () => {
        if (!selectedStrategy) return;
        setLoading(true);
        setError('');
        try {
            const mockRecommendations: StockRecommendation[] = [
                {
                    ticker: 'AAPL',
                    name: 'Apple Inc.',
                    price: 175.50,
                    guruRating: 95,
                    reasoning: 'Strong moat with ecosystem lock-in, consistent revenue growth, and strong cash position.',
                    riskLevel: 'Low',
                    expectedReturn: 12.5,
                },
                {
                    ticker: 'MSFT',
                    name: 'Microsoft Corporation',
                    price: 350.25,
                    guruRating: 92,
                    reasoning: 'Dominant in enterprise software, cloud growth, and strong recurring revenue model.',
                    riskLevel: 'Low',
                    expectedReturn: 11.8,
                },
                {
                    ticker: 'GOOGL',
                    name: 'Alphabet Inc.',
                    price: 2800.75,
                    guruRating: 88,
                    reasoning: 'Search engine dominance, YouTube growth, and AI leadership position.',
                    riskLevel: 'Medium',
                    expectedReturn: 15.2,
                },
            ];
            setRecommendations(mockRecommendations);
            setShowRecommendationsModal(true);
        } catch (err) {
            console.error('Error getting recommendations:', err);
            setError('Failed to get recommendations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'Low': return 'success';
            case 'Medium': return 'warning';
            case 'High': return 'danger';
            default: return 'secondary';
        }
    };

    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <p className="text-muted text-center">
                    <Link to="/login">Log in</Link> to access Beginner Mode.
                </p>
            </Container>
        );
    }

    return (
        <Container fluid className="px-0">

            {/* Page Header */}
            <div className="bm-page-header">
                <Container>
                    <span className="bm-eyebrow">Learn</span>
                    <h1 className="bm-headline">
                        Invest like<br /><em>the legends.</em>
                    </h1>
                    <p className="bm-sub">
                        Learn from Buffett, Lynch, Graham, and Dalio — AI-powered guidance
                        with built-in safety guardrails.
                    </p>
                </Container>
            </div>

            {/* Guru Strategies */}
            <div className="bm-section">
                <Container>
                    <span className="sn-section-label">Choose your investment approach</span>
                    <Row className="g-4">
                        {guruStrategies.map((strategy) => (
                            <Col lg={6} key={strategy.id}>
                                <div
                                    className="bm-guru-card"
                                    onClick={() => handleStrategySelect(strategy)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && handleStrategySelect(strategy)}
                                >
                                    <span className="bm-guru-eyebrow">{strategy.id.toUpperCase()}</span>
                                    <h3 className="bm-guru-name">{strategy.name}</h3>
                                    <p className="bm-guru-desc">{strategy.description}</p>
                                    <ul className="bm-guru-principles">
                                        {strategy.principles.map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                    <div className="bm-guru-tickers">
                                        {strategy.exampleStocks.map((t) => (
                                            <span key={t} className="bm-ticker-pill">{t}</span>
                                        ))}
                                    </div>
                                    <button className="bm-guru-btn">Learn this strategy →</button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>

            {/* Safety Guardrails */}
            <div className="bm-section">
                <Container>
                    <span className="sn-section-label">Built-in protection</span>
                    <div className="bm-guardrail-grid">
                        {GUARDRAILS.map(({ label, desc }) => (
                            <div key={label} className="bm-guardrail-item">
                                <div className="bm-guardrail-label">{label}</div>
                                <p className="bm-guardrail-desc">{desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="d-flex gap-3 flex-wrap">
                        <Link to="/portfolio" className="sn-btn-primary">Manage portfolio</Link>
                        <Link to="/screener" className="sn-btn-ghost">Find stocks</Link>
                        <Link to="/advanced-mode" className="sn-btn-ghost">Switch to Advanced →</Link>
                    </div>
                </Container>
            </div>

            {error && (
                <Container className="pt-3">
                    <Alert variant="danger">{error}</Alert>
                </Container>
            )}

            {/* Strategy Modal */}
            <Modal show={showStrategyModal} onHide={() => setShowStrategyModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedStrategy?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStrategy && (
                        <>
                            <p style={{ color: 'var(--ink-300)', marginBottom: '1.5rem' }}>
                                {selectedStrategy.description}
                            </p>
                            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: '0.75rem' }}>
                                Investment Principles
                            </p>
                            <ul className="bm-guru-principles" style={{ marginBottom: '1.5rem' }}>
                                {selectedStrategy.principles.map((p, i) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>
                            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', marginBottom: '0.75rem' }}>
                                Example Stocks
                            </p>
                            <div className="bm-guru-tickers">
                                {selectedStrategy.exampleStocks.map((t) => (
                                    <Badge key={t} bg="secondary" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem' }}>
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="sn-btn-ghost"
                        style={{ background: 'transparent', border: '1px solid var(--ink-500)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--ink-300)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.875rem' }}
                        onClick={() => setShowStrategyModal(false)}
                    >
                        Close
                    </button>
                    <button
                        className="bm-guru-btn"
                        style={{ width: 'auto', padding: '0.5rem 1.25rem' }}
                        onClick={handleGetRecommendations}
                        disabled={loading}
                    >
                        {loading ? 'Getting recommendations…' : 'Get AI recommendations →'}
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Recommendations Modal */}
            <Modal show={showRecommendationsModal} onHide={() => setShowRecommendationsModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>AI Recommendations — {selectedStrategy?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        {recommendations.map((rec, i) => (
                            <Col md={6} key={i}>
                                <div style={{ background: 'var(--ink-600)', border: '1px solid var(--ink-500)', borderLeft: '3px solid var(--growth)', borderRadius: 8, padding: '1.25rem', height: '100%' }}>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--ink-100)', fontSize: '0.9rem' }}>{rec.ticker}</span>
                                            <div style={{ color: 'var(--ink-400)', fontSize: '0.8rem' }}>{rec.name}</div>
                                        </div>
                                        <Badge bg={getRiskColor(rec.riskLevel)} style={{ fontSize: '0.65rem' }}>
                                            {rec.riskLevel} risk
                                        </Badge>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'var(--ink-100)' }}>${rec.price.toFixed(2)}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--ink-400)' }}>Price</div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'var(--amber)' }}>{rec.guruRating}/100</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--ink-400)' }}>Guru rating</div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', color: 'var(--gain)' }}>{rec.expectedReturn}%</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--ink-400)' }}>Exp. return</div>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--ink-400)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{rec.reasoning}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        style={{ background: 'transparent', border: '1px solid var(--ink-500)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--ink-300)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '0.875rem' }}
                        onClick={() => setShowRecommendationsModal(false)}
                    >
                        Close
                    </button>
                    <Link to="/portfolio" className="bm-guru-btn" style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'inline-block', textDecoration: 'none' }}>
                        Build portfolio →
                    </Link>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BeginnerMode;
