import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { SentimentAnalysisData } from '../../types';

interface SentimentAnalysisProps {
    onSentimentUpdate?: (data: SentimentAnalysisData) => void;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ onSentimentUpdate }) => {
    const [sentimentData, setSentimentData] = useState<SentimentAnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicker, setSelectedTicker] = useState('AAPL');

    const fetchSentiment = async (ticker: string) => {
        if (!ticker || ticker.trim() === '') {
            setError('Please enter a valid stock ticker');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.AI_SENTIMENT(ticker.trim().toUpperCase())}`);
            setSentimentData(response.data);
            onSentimentUpdate?.(response.data);
        } catch (err) {
            setError('Failed to fetch sentiment data');
            console.error('Error fetching sentiment:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (sentiment: number) => {
        if (sentiment > 0.1) return 'success';
        if (sentiment < -0.1) return 'danger';
        return 'warning';
    };

    const getSentimentLabel = (sentiment: number) => {
        if (sentiment > 0.1) return 'Positive';
        if (sentiment < -0.1) return 'Negative';
        return 'Neutral';
    };

    return (
        <Card className="mb-4">
            <Card.Header>
                <h5>Sentiment Analysis</h5>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Row>
                    <Col lg={6} md={12} className="mb-3">
                        <Form.Group className="mb-3">
                            <Form.Label>Stock Ticker</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedTicker}
                                onChange={(e) => setSelectedTicker(e.target.value.toUpperCase())}
                                placeholder="Enter ticker (e.g., AAPL)"
                                minLength={1}
                                required
                            />
                            {!selectedTicker.trim() && (
                                <Form.Text className="text-muted">
                                    Please enter a valid stock ticker symbol
                                </Form.Text>
                            )}
                        </Form.Group>
                        <Button
                            variant="primary"
                            onClick={() => fetchSentiment(selectedTicker)}
                            disabled={loading || !selectedTicker.trim()}
                            className="w-100 w-md-auto"
                        >
                            {loading ? 'Analyzing...' : 'Analyze Sentiment'}
                        </Button>
                    </Col>
                    <Col lg={6} md={12}>
                        {sentimentData && (
                            <div>
                                <h6>Overall Sentiment</h6>
                                <Badge
                                    bg={getSentimentColor(sentimentData.overall_sentiment)}
                                    className="mb-2"
                                >
                                    {getSentimentLabel(sentimentData.overall_sentiment)}
                                    ({sentimentData.overall_sentiment.toFixed(3)})
                                </Badge>
                                <div className="mb-2">
                                    <small>Confidence: {(sentimentData.confidence * 100).toFixed(1)}%</small>
                                </div>
                                <div className="mb-2">
                                    <small>Volume: {sentimentData.volume} mentions</small>
                                </div>
                                <div>
                                    <small>
                                        Positive: {sentimentData.positive_count} |
                                        Negative: {sentimentData.negative_count} |
                                        Neutral: {sentimentData.neutral_count}
                                    </small>
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>

                {sentimentData && (
                    <Row className="mt-3">
                        <Col lg={6} md={12} className="mb-3">
                            <h6>Sentiment by Source</h6>
                            <div className="table-responsive">
                                <Table size="sm">
                                    <thead>
                                        <tr>
                                            <th>Source</th>
                                            <th>Sentiment</th>
                                            <th>Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(sentimentData.sources).map(([source, data]) => (
                                            <tr key={source}>
                                                <td>{source.charAt(0).toUpperCase() + source.slice(1)}</td>
                                                <td>
                                                    <Badge bg={getSentimentColor(data.sentiment)}>
                                                        {data.sentiment.toFixed(3)}
                                                    </Badge>
                                                </td>
                                                <td>{data.volume}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                        <Col lg={6} md={12}>
                            <h6>Top Keywords</h6>
                            <div>
                                {sentimentData.top_keywords.map((keyword, index) => (
                                    <Badge key={index} bg="secondary" className="me-1 mb-1">
                                        {keyword}
                                    </Badge>
                                ))}
                            </div>
                        </Col>
                    </Row>
                )}
            </Card.Body>
        </Card>
    );
};

export default SentimentAnalysis;
