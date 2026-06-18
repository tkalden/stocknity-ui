import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Col, Row, Table } from 'react-bootstrap';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { SentimentAnalysisData } from '../../types';

interface SentimentAnalysisProps {
    onSentimentUpdate?: (data: SentimentAnalysisData) => void;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ onSentimentUpdate }) => {
    const [sentimentData, setSentimentData] = useState<SentimentAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ticker, setTicker] = useState('AAPL');

    const fetchSentiment = async () => {
        const sym = ticker.trim().toUpperCase();
        if (!sym) { setError('Enter a ticker symbol'); return; }
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.AI_SENTIMENT(sym)}`);
            setSentimentData(response.data);
            onSentimentUpdate?.(response.data);
        } catch (err) {
            setError('Failed to fetch sentiment data');
            console.error('Error fetching sentiment:', err);
        } finally {
            setLoading(false);
        }
    };

    const sentimentColor = (s: number) => {
        if (s > 0.1) return 'var(--gain)';
        if (s < -0.1) return 'var(--loss)';
        return 'var(--amber)';
    };

    const sentimentLabel = (s: number) => {
        if (s > 0.1) return 'Positive';
        if (s < -0.1) return 'Negative';
        return 'Neutral';
    };

    const sentimentBg = (s: number) => {
        if (s > 0.1) return 'success';
        if (s < -0.1) return 'danger';
        return 'warning';
    };

    return (
        <div>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            <div className="d-flex gap-2 align-items-center flex-wrap mb-4">
                <input
                    type="text"
                    className="ai-ticker-input"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="AAPL"
                    onKeyDown={(e) => e.key === 'Enter' && fetchSentiment()}
                />
                <button
                    className="sn-btn-primary"
                    onClick={fetchSentiment}
                    disabled={loading || !ticker.trim()}
                    style={{ opacity: (loading || !ticker.trim()) ? 0.5 : 1 }}
                >
                    {loading ? 'Analyzing…' : 'Analyze sentiment'}
                </button>
            </div>

            {sentimentData && (
                <Row className="g-4">
                    <Col lg={4} md={12}>
                        <div style={{ background: 'var(--ink-700)', border: '1px solid var(--ink-500)', borderLeft: `3px solid ${sentimentColor(sentimentData.overall_sentiment)}`, borderRadius: 8, padding: '1.5rem' }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', display: 'block', marginBottom: '0.75rem' }}>
                                {ticker} · Overall
                            </span>
                            <div className="ai-sentiment-score" style={{ color: sentimentColor(sentimentData.overall_sentiment) }}>
                                {sentimentLabel(sentimentData.overall_sentiment)}
                            </div>
                            <div className="ai-sentiment-meta" style={{ marginTop: '0.75rem' }}>
                                <div>Score: {sentimentData.overall_sentiment.toFixed(3)}</div>
                                <div>Confidence: {(sentimentData.confidence * 100).toFixed(1)}%</div>
                                <div>Volume: {sentimentData.volume} mentions</div>
                                <div style={{ color: 'var(--gain)' }}>↑ {sentimentData.positive_count}</div>
                                <div style={{ color: 'var(--loss)' }}>↓ {sentimentData.negative_count}</div>
                                <div>– {sentimentData.neutral_count}</div>
                            </div>
                        </div>
                    </Col>
                    <Col lg={4} md={6}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', display: 'block', marginBottom: '0.75rem' }}>
                            By source
                        </span>
                        <div className="table-responsive">
                            <Table size="sm" hover>
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>Score</th>
                                        <th>Volume</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(sentimentData.sources).map(([source, data]) => (
                                        <tr key={source}>
                                            <td style={{ textTransform: 'capitalize' }}>{source}</td>
                                            <td style={{ fontFamily: 'JetBrains Mono, monospace', color: sentimentColor(data.sentiment) }}>
                                                {data.sentiment.toFixed(3)}
                                            </td>
                                            <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-400)' }}>{data.volume}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                    <Col lg={4} md={6}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', display: 'block', marginBottom: '0.75rem' }}>
                            Top keywords
                        </span>
                        <div className="d-flex flex-wrap gap-2">
                            {sentimentData.top_keywords.map((kw, i) => (
                                <span key={i} className="ai-keyword-chip">{kw}</span>
                            ))}
                        </div>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default SentimentAnalysis;
