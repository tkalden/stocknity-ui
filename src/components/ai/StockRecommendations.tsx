import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
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

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.AI_RECOMMENDATIONS}`, {
                params: {
                    time_horizon: timeHorizon,
                    risk_tolerance: riskTolerance,
                    limit: 10
                }
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

    const getRiskColor = (risk: number) => {
        if (risk < 0.3) return 'success';
        if (risk < 0.6) return 'warning';
        return 'danger';
    };

    const getRiskLabel = (risk: number) => {
        if (risk < 0.3) return 'Low';
        if (risk < 0.6) return 'Medium';
        return 'High';
    };

    const handleRecommendationClick = (recommendation: StockRecommendation) => {
        onRecommendationSelect?.(recommendation);
    };

    return (
        <Card className="mb-4">
            <Card.Header>
                <h5>AI Stock Recommendations</h5>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Row className="mb-3">
                    <Col lg={4} md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Time Horizon</Form.Label>
                            <Form.Select
                                value={timeHorizon}
                                onChange={(e) => setTimeHorizon(e.target.value)}
                            >
                                <option value="short">Short-term (1-7 days)</option>
                                <option value="medium">Medium-term (1-3 months)</option>
                                <option value="long">Long-term (3-12 months)</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={4} md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label>Risk Tolerance</Form.Label>
                            <Form.Select
                                value={riskTolerance}
                                onChange={(e) => setRiskTolerance(e.target.value)}
                            >
                                <option value="low">Low Risk</option>
                                <option value="medium">Medium Risk</option>
                                <option value="high">High Risk</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={4} md={12}>
                        <Form.Group>
                            <Form.Label>&nbsp;</Form.Label>
                            <div>
                                <Button
                                    variant="outline-primary"
                                    onClick={fetchRecommendations}
                                    disabled={loading}
                                    className="w-100 w-lg-auto"
                                >
                                    {loading ? 'Loading...' : 'Refresh Recommendations'}
                                </Button>
                            </div>
                        </Form.Group>
                    </Col>
                </Row>

                {recommendations.length > 0 && (
                    <div className="table-responsive">
                        <Table className="ai-analysis-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Ticker</th>
                                    <th>AI Score</th>
                                    <th>Confidence</th>
                                    <th>Risk Level</th>
                                    <th>Predicted Return</th>
                                    <th>Data Sources</th>
                                    <th>Reasoning</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recommendations.map((rec, index) => (
                                    <tr key={rec.ticker}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{rec.ticker}</strong>
                                        </td>
                                        <td>
                                            <ProgressBar
                                                now={rec.score * 100}
                                                variant="success"
                                                label={`${(rec.score * 100).toFixed(0)}%`}
                                            />
                                        </td>
                                        <td>{(rec.confidence * 100).toFixed(0)}%</td>
                                        <td>
                                            <Badge bg={getRiskColor(rec.risk_score)}>
                                                {getRiskLabel(rec.risk_score)}
                                            </Badge>
                                        </td>
                                        <td className="text-success">
                                            +{(rec.predicted_return * 100).toFixed(1)}%
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {rec.data_sources.map((source, i) => (
                                                    <Badge key={i} bg="info">
                                                        {source}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <small className="d-none d-md-block">{rec.reasoning}</small>
                                            <small className="d-md-none">{rec.reasoning.substring(0, 50)}...</small>
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => handleRecommendationClick(rec)}
                                                className="w-100 w-sm-auto"
                                            >
                                                Select
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default StockRecommendations;
