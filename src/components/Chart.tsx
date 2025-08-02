import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Badge, Card, Col, Container, Nav, Row, Table } from 'react-bootstrap';
import { API_BASE_URL } from '../config/api';

interface ChartData {
    id: string;
    labels: string[];
    title: string;
    values: number[];
}

interface ChartResponse {
    data: ChartData[];
}

const Chart: React.FC = () => {
    const [activeTab, setActiveTab] = useState('value');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chartData, setChartData] = useState<ChartData[]>([]);

    const handleChartView = async (chartType: string) => {
        setLoading(true);
        setError('');
        setActiveTab(chartType);

        try {
            console.log(`Fetching ${chartType} chart data from: ${API_BASE_URL}/chart/${chartType}`);

            const response = await axios.get<ChartResponse>(`${API_BASE_URL}/chart/${chartType}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(`${chartType} chart response:`, response);

            if (response.data && response.data.data) {
                setChartData(response.data.data);
                console.log(`${chartType} chart data set:`, response.data.data);
            } else {
                console.error(`No data in response for ${chartType} chart:`, response);
                setError(`No data available for ${chartType} chart.`);
            }
        } catch (error: any) {
            console.error(`Error loading ${chartType} chart:`, error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            setError(`Failed to load ${chartType} chart: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Chart component mounted, loading value chart...');
        handleChartView('value');
    }, []);

    const formatValue = (value: number) => {
        return value.toFixed(2);
    };

    const getValueColor = (value: number) => {
        if (value > 0) return 'text-success';
        if (value < 0) return 'text-danger';
        return 'text-muted';
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card>
                        <Card.Header as="h4">Market Analysis Charts</Card.Header>
                        <Card.Body>
                            <Nav variant="tabs" className="mb-3">
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'value'}
                                        onClick={() => handleChartView('value')}
                                    >
                                        Value Stocks
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'growth'}
                                        onClick={() => handleChartView('growth')}
                                    >
                                        Growth Stocks
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        active={activeTab === 'dividend'}
                                        onClick={() => handleChartView('dividend')}
                                    >
                                        Dividend Stocks
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2">Loading chart data...</p>
                                </div>
                            ) : chartData.length > 0 ? (
                                <div className="chart-container">
                                    <div className="mb-4">
                                        <h5>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Stocks Analysis</h5>
                                        <p className="text-muted">
                                            Top 5 stocks by strength in each sector
                                        </p>
                                    </div>

                                    {chartData.map((sector, sectorIndex) => (
                                        <Card key={sectorIndex} className="mb-4">
                                            <Card.Header>
                                                <h6 className="mb-0">
                                                    {sector.title}
                                                    <Badge bg="info" className="ms-2">
                                                        {sector.labels.length} stocks
                                                    </Badge>
                                                </h6>
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="table-responsive">
                                                    <Table striped bordered hover size="sm">
                                                        <thead>
                                                            <tr>
                                                                <th>Rank</th>
                                                                <th>Ticker</th>
                                                                <th>Strength Value</th>
                                                                <th>Performance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sector.labels.map((ticker, tickerIndex) => (
                                                                <tr key={tickerIndex}>
                                                                    <td>
                                                                        <Badge bg={tickerIndex === 0 ? "warning" : "secondary"}>
                                                                            #{tickerIndex + 1}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <strong>{ticker}</strong>
                                                                    </td>
                                                                    <td>
                                                                        <span className={getValueColor(sector.values[tickerIndex])}>
                                                                            {formatValue(sector.values[tickerIndex])}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <div className="progress" style={{ height: '20px' }}>
                                                                            <div
                                                                                className={`progress-bar ${sector.values[tickerIndex] > 0 ? 'bg-success' : 'bg-danger'}`}
                                                                                role="progressbar"
                                                                                style={{
                                                                                    width: `${Math.abs(sector.values[tickerIndex]) * 10}%`,
                                                                                    minWidth: '20px'
                                                                                }}
                                                                                aria-valuenow={Math.abs(sector.values[tickerIndex])}
                                                                                aria-valuemin={0}
                                                                                aria-valuemax={20}
                                                                            >
                                                                                {formatValue(sector.values[tickerIndex])}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <h5>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Stocks Analysis</h5>
                                    <p className="text-muted">
                                        No chart data available. Please try again later.
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleChartView(activeTab)}
                                    >
                                        Retry Loading Data
                                    </button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Chart; 