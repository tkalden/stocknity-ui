import React, { useEffect, useState } from 'react';
import { Alert, Badge } from 'react-bootstrap';
import { API_ENDPOINTS } from '../../config/api';
import { apiClient } from '../../utils/api';
import { StockRecommendation } from '../../types';

interface StockRecommendationsProps {
    onRecommendationSelect?: (recommendation: StockRecommendation) => void;
}

const StockRecommendations: React.FC<StockRecommendationsProps> = ({ onRecommendationSelect }) => {
    const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeHorizon, setTimeHorizon] = useState('medium');
    const [riskTolerance, setRiskTolerance] = useState('medium');
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get(API_ENDPOINTS.AI_RECOMMENDATIONS, {
                params: { time_horizon: timeHorizon, risk_tolerance: riskTolerance, limit: 10 },
            });
            setRecommendations(response.data.recommendations);
        } catch (err) {
            setError('Failed to fetch recommendations');
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeHorizon, riskTolerance]);

    const riskColor = (r: number) => r < 0.3 ? 'success' : r < 0.6 ? 'warning' : 'danger';
    const riskLabel = (r: number) => r < 0.3 ? 'Low' : r < 0.6 ? 'Med' : 'High';

    const handleSelect = (rec: StockRecommendation) => {
        setSelectedTicker(rec.ticker);
        onRecommendationSelect?.(rec);
    };

    return (
        <div>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            <div className="d-flex gap-2 align-items-center flex-wrap mb-4">
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(e.target.value)}
                >
                    <option value="short">Short-term (1–7 days)</option>
                    <option value="medium">Medium-term (1–3 months)</option>
                    <option value="long">Long-term (3–12 months)</option>
                </select>
                <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value)}
                >
                    <option value="low">Low risk</option>
                    <option value="medium">Medium risk</option>
                    <option value="high">High risk</option>
                </select>
                <button
                    className="sn-btn-ghost"
                    onClick={fetchRecommendations}
                    disabled={loading}
                    style={{ opacity: loading ? 0.5 : 1 }}
                >
                    {loading ? 'Loading…' : 'Refresh'}
                </button>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading…</span>
                    </div>
                </div>
            )}

            {!loading && recommendations.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-hover" style={{ fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ticker</th>
                                <th>AI Score</th>
                                <th>Confidence</th>
                                <th>Risk</th>
                                <th>Pred. Return</th>
                                <th>Sources</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recommendations.map((rec, i) => (
                                <tr
                                    key={rec.ticker}
                                    style={{
                                        cursor: 'pointer',
                                        background: selectedTicker === rec.ticker ? 'var(--electric-dim)' : undefined,
                                    }}
                                    onClick={() => handleSelect(rec)}
                                >
                                    <td style={{ color: 'var(--ink-400)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{i + 1}</td>
                                    <td>
                                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: selectedTicker === rec.ticker ? 'var(--electric-light)' : 'var(--ink-100)' }}>
                                            {rec.ticker}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ai-score-bar">
                                            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--electric-light)', fontSize: '0.8rem', minWidth: 32 }}>
                                                {(rec.score * 100).toFixed(0)}%
                                            </span>
                                            <div className="ai-score-track">
                                                <div className="ai-score-fill" style={{ width: `${rec.score * 100}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-300)' }}>
                                        {(rec.confidence * 100).toFixed(0)}%
                                    </td>
                                    <td>
                                        <Badge bg={riskColor(rec.risk_score)} style={{ fontSize: '0.65rem' }}>
                                            {riskLabel(rec.risk_score)}
                                        </Badge>
                                    </td>
                                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--gain)' }}>
                                        +{(rec.predicted_return * 100).toFixed(1)}%
                                    </td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-1">
                                            {rec.data_sources.map((src, si) => (
                                                <span key={si} className="ai-keyword-chip">{src}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className={selectedTicker === rec.ticker ? 'sn-btn-primary' : 'sn-btn-ghost'}
                                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                            onClick={(e) => { e.stopPropagation(); handleSelect(rec); }}
                                        >
                                            {selectedTicker === rec.ticker ? 'Selected' : 'Select'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StockRecommendations;
