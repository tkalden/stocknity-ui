import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { ModelPerformanceData } from '../../types';

interface ModelPerformanceProps {
    onPerformanceUpdate?: (data: ModelPerformanceData) => void;
}

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ onPerformanceUpdate }) => {
    const [performance, setPerformance] = useState<ModelPerformanceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPerformance = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.AI_PERFORMANCE}`);
            setPerformance(response.data);
            onPerformanceUpdate?.(response.data);
        } catch (err) {
            setError('Failed to fetch performance metrics');
            console.error('Error fetching performance:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
    }

    if (error) return <Alert variant="danger">{error}</Alert>;

    if (!performance) return null;

    return (
        <div>
            <div className="ai-model-grid">
                {/* Sentiment Model */}
                <div className="ai-model-card">
                    <span className="ai-model-name">Sentiment model</span>
                    {[
                        { label: 'Accuracy', value: `${(performance.models.sentiment.accuracy * 100).toFixed(1)}%` },
                        { label: 'Precision', value: `${(performance.models.sentiment.precision * 100).toFixed(1)}%` },
                        { label: 'Recall', value: `${(performance.models.sentiment.recall * 100).toFixed(1)}%` },
                        { label: 'F1 Score', value: `${(performance.models.sentiment.f1_score * 100).toFixed(1)}%` },
                    ].map(({ label, value }) => (
                        <div key={label} className="ai-metric-row">
                            <span className="ai-metric-label">{label}</span>
                            <span className="ai-metric-value">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Price Prediction Model */}
                <div className="ai-model-card">
                    <span className="ai-model-name">Price prediction</span>
                    {[
                        { label: 'MAE', value: performance.models.price_prediction.mae.toFixed(3) },
                        { label: 'RMSE', value: performance.models.price_prediction.rmse.toFixed(3) },
                        { label: 'R² Score', value: `${(performance.models.price_prediction.r2_score * 100).toFixed(1)}%` },
                    ].map(({ label, value }) => (
                        <div key={label} className="ai-metric-row">
                            <span className="ai-metric-label">{label}</span>
                            <span className="ai-metric-value">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Recommendation Model */}
                <div className="ai-model-card">
                    <span className="ai-model-name">Recommendation</span>
                    {[
                        { label: 'Win Rate', value: `${(performance.models.recommendation.win_rate * 100).toFixed(1)}%` },
                        { label: 'Avg Return', value: `${(performance.models.recommendation.avg_return * 100).toFixed(1)}%` },
                        { label: 'Sharpe Ratio', value: performance.models.recommendation.sharpe_ratio.toFixed(2) },
                        { label: 'Max Drawdown', value: `${(performance.models.recommendation.max_drawdown * 100).toFixed(1)}%` },
                    ].map(({ label, value }) => (
                        <div key={label} className="ai-metric-row">
                            <span className="ai-metric-label">{label}</span>
                            <span className="ai-metric-value">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overall */}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', display: 'block', marginBottom: '1rem' }}>
                Overall performance
            </span>
            <div className="ai-overall-grid">
                <div className="ai-overall-item">
                    <span className="ai-overall-num">{performance.overall_performance.total_recommendations}</span>
                    <span className="ai-overall-label">Total recommendations</span>
                </div>
                <div className="ai-overall-item">
                    <span className="ai-overall-num" style={{ color: 'var(--gain)' }}>
                        {performance.overall_performance.profitable_recommendations}
                    </span>
                    <span className="ai-overall-label">Profitable</span>
                </div>
                <div className="ai-overall-item">
                    <span className="ai-overall-num">{performance.overall_performance.avg_holding_period}</span>
                    <span className="ai-overall-label">Avg holding period</span>
                </div>
            </div>
        </div>
    );
};

export default ModelPerformance;
