import React, { useState } from 'react';
import { ModelPerformanceData, SentimentAnalysisData, StockRecommendation } from '../types/ai';
import ModelPerformance from './ai/ModelPerformance';
import SentimentAnalysis from './ai/SentimentAnalysis';
import StockRecommendations from './ai/StockRecommendations';

const AIAnalysis: React.FC = () => {
    const [selectedRecommendation, setSelectedRecommendation] = useState<StockRecommendation | null>(null);

    const handleSentimentUpdate = (data: SentimentAnalysisData) => {
        console.log('Sentiment updated:', data);
    };

    const handleRecommendationSelect = (recommendation: StockRecommendation) => {
        setSelectedRecommendation(recommendation);
        console.log('Recommendation selected:', recommendation);
    };

    const handlePerformanceUpdate = (data: ModelPerformanceData) => {
        console.log('Performance updated:', data);
    };

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4">AI-Powered Investment Analysis</h2>
                </div>
            </div>

            {/* Sentiment Analysis Component */}
            <div className="row">
                <div className="col-12">
                    <SentimentAnalysis onSentimentUpdate={handleSentimentUpdate} />
                </div>
            </div>

            {/* Stock Recommendations Component */}
            <div className="row">
                <div className="col-12">
                    <StockRecommendations onRecommendationSelect={handleRecommendationSelect} />
                </div>
            </div>

            {/* Model Performance Component */}
            <div className="row">
                <div className="col-12">
                    <ModelPerformance onPerformanceUpdate={handlePerformanceUpdate} />
                </div>
            </div>

            {/* Selected Recommendation Summary */}
            {selectedRecommendation && (
                <div className="row">
                    <div className="col-12">
                        <div className="mt-4 p-3 bg-light rounded">
                            <h6>Selected Recommendation</h6>
                            <div className="row">
                                <div className="col-md-8">
                                    <p className="mb-2">
                                        <strong>{selectedRecommendation.ticker}</strong> -
                                        Score: {(selectedRecommendation.score * 100).toFixed(0)}% |
                                        Predicted Return: +{(selectedRecommendation.predicted_return * 100).toFixed(1)}% |
                                        Confidence: {(selectedRecommendation.confidence * 100).toFixed(0)}%
                                    </p>
                                </div>
                                <div className="col-md-4 text-md-end">
                                    <small className="text-muted d-block d-md-none">
                                        {selectedRecommendation.reasoning.substring(0, 100)}...
                                    </small>
                                    <small className="text-muted d-none d-md-block">
                                        {selectedRecommendation.reasoning}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAnalysis;
