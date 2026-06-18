import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { ModelPerformanceData, SentimentAnalysisData, StockRecommendation } from '../types/ai';
import ModelPerformance from './ai/ModelPerformance';
import SentimentAnalysis from './ai/SentimentAnalysis';
import StockRecommendations from './ai/StockRecommendations';

const AIAnalysis: React.FC = () => {
    const [selectedRecommendation, setSelectedRecommendation] = useState<StockRecommendation | null>(null);

    const handleSentimentUpdate = (data: SentimentAnalysisData) => {
        console.log('Sentiment updated:', data);
    };

    const handleRecommendationSelect = (rec: StockRecommendation) => {
        setSelectedRecommendation(rec);
    };

    const handlePerformanceUpdate = (data: ModelPerformanceData) => {
        console.log('Performance updated:', data);
    };

    return (
        <div style={{ background: 'var(--ink-800)' }}>

            {/* Page Header */}
            <div className="ai-page-header">
                <Container>
                    <span className="ai-eyebrow">Analyze</span>
                    <h1 className="ai-headline">
                        AI-powered<br /><em>market intelligence.</em>
                    </h1>
                    <p className="ai-sub">
                        Sentiment analysis, AI stock recommendations, and live model
                        performance metrics — all in one place.
                    </p>
                </Container>
            </div>

            {/* Sentiment */}
            <div className="ai-section">
                <Container>
                    <span className="sn-section-label">Sentiment analysis</span>
                    <SentimentAnalysis onSentimentUpdate={handleSentimentUpdate} />
                </Container>
            </div>

            {/* Recommendations */}
            <div className="ai-section">
                <Container>
                    <span className="sn-section-label">AI stock recommendations</span>
                    <StockRecommendations onRecommendationSelect={handleRecommendationSelect} />
                </Container>
            </div>

            {/* Selected recommendation panel */}
            {selectedRecommendation && (
                <div className="ai-section">
                    <Container>
                        <span className="sn-section-label">Selected</span>
                        <div className="ai-selected-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--electric-light)', display: 'block', marginBottom: '0.4rem' }}>
                                        Selected stock
                                    </span>
                                    <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '2rem', color: 'var(--ink-100)', fontWeight: 400, lineHeight: 1, marginBottom: '0.5rem' }}>
                                        {selectedRecommendation.ticker}
                                    </div>
                                    <p style={{ color: 'var(--ink-400)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
                                        {selectedRecommendation.reasoning}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'AI Score', value: `${(selectedRecommendation.score * 100).toFixed(0)}%`, color: 'var(--electric-light)' },
                                        { label: 'Pred. Return', value: `+${(selectedRecommendation.predicted_return * 100).toFixed(1)}%`, color: 'var(--gain)' },
                                        { label: 'Confidence', value: `${(selectedRecommendation.confidence * 100).toFixed(0)}%`, color: 'var(--ink-200)' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', color, lineHeight: 1 }}>{value}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--ink-400)', marginTop: '0.25rem' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            )}

            {/* Model Performance */}
            <div className="ai-section" style={{ borderBottom: 'none' }}>
                <Container>
                    <span className="sn-section-label">Model performance</span>
                    <ModelPerformance onPerformanceUpdate={handlePerformanceUpdate} />
                </Container>
            </div>
        </div>
    );
};

export default AIAnalysis;
