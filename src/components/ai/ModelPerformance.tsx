import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Table } from 'react-bootstrap';
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
            <Card>
                <Card.Header>
                    <h5>AI Model Performance</h5>
                </Card.Header>
                <Card.Body>
                    <div className="text-center">Loading performance metrics...</div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header>
                <h5>AI Model Performance</h5>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                {performance && (
                    <>
                        <Row>
                            <Col lg={4} md={6} className="mb-3">
                                <h6>Sentiment Model</h6>
                                <div className="table-responsive">
                                    <Table size="sm">
                                        <tbody>
                                            <tr>
                                                <td>Accuracy</td>
                                                <td>{(performance.models.sentiment.accuracy * 100).toFixed(1)}%</td>
                                            </tr>
                                            <tr>
                                                <td>Precision</td>
                                                <td>{(performance.models.sentiment.precision * 100).toFixed(1)}%</td>
                                            </tr>
                                            <tr>
                                                <td>Recall</td>
                                                <td>{(performance.models.sentiment.recall * 100).toFixed(1)}%</td>
                                            </tr>
                                            <tr>
                                                <td>F1 Score</td>
                                                <td>{(performance.models.sentiment.f1_score * 100).toFixed(1)}%</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                            <Col lg={4} md={6} className="mb-3">
                                <h6>Price Prediction Model</h6>
                                <div className="table-responsive">
                                    <Table size="sm">
                                        <tbody>
                                            <tr>
                                                <td>MAE</td>
                                                <td>{performance.models.price_prediction.mae.toFixed(3)}</td>
                                            </tr>
                                            <tr>
                                                <td>RMSE</td>
                                                <td>{performance.models.price_prediction.rmse.toFixed(3)}</td>
                                            </tr>
                                            <tr>
                                                <td>R² Score</td>
                                                <td>{(performance.models.price_prediction.r2_score * 100).toFixed(1)}%</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                            <Col lg={4} md={12}>
                                <h6>Recommendation Model</h6>
                                <div className="table-responsive">
                                    <Table size="sm">
                                        <tbody>
                                            <tr>
                                                <td>Win Rate</td>
                                                <td>{(performance.models.recommendation.win_rate * 100).toFixed(1)}%</td>
                                            </tr>
                                            <tr>
                                                <td>Avg Return</td>
                                                <td>{(performance.models.recommendation.avg_return * 100).toFixed(1)}%</td>
                                            </tr>
                                            <tr>
                                                <td>Sharpe Ratio</td>
                                                <td>{performance.models.recommendation.sharpe_ratio.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td>Max Drawdown</td>
                                                <td>{(performance.models.recommendation.max_drawdown * 100).toFixed(1)}%</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col>
                                <h6>Overall Performance</h6>
                                <Table size="sm">
                                    <tbody>
                                        <tr>
                                            <td>Total Recommendations</td>
                                            <td>{performance.overall_performance.total_recommendations}</td>
                                        </tr>
                                        <tr>
                                            <td>Profitable Recommendations</td>
                                            <td>{performance.overall_performance.profitable_recommendations}</td>
                                        </tr>
                                        <tr>
                                            <td>Average Holding Period</td>
                                            <td>{performance.overall_performance.avg_holding_period}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default ModelPerformance;
