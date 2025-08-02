import axios from 'axios';
import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface NewsItem {
    title: string;
    link: string;
    published: string;
}

const Home: React.FC = () => {
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [subscribeLoading, setSubscribeLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribeLoading(true);

        try {
            await axios.post('/subscribe', {
                email: subscribeEmail
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setSubscribeEmail('');
            alert('Thank you for subscribing!');
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Subscription failed. Please try again.');
        } finally {
            setSubscribeLoading(false);
        }
    };

    return (
        <Container fluid className="px-0">
            {/* Hero Section */}
            <div className="hero-section text-center py-5 mb-5">
                <Container>
                    <div className="hero-content">
                        <h1 className="display-3 fw-bold mb-4 text-gradient">
                            Welcome to Stocknity
                        </h1>
                        <p className="lead mb-4 text-light">
                            Your comprehensive platform for stock screening, portfolio optimization, and market analysis.
                            <br />
                            <span className="text-muted">Professional tools for smart investors.</span>
                        </p>
                        <div className="hero-buttons">
                            <Link to="/screener" className="btn btn-primary btn-lg me-3 mb-2">
                                <i className="fas fa-search me-2"></i>
                                Start Screening
                            </Link>
                            <Link to="/signup" className="btn btn-outline-primary btn-lg mb-2">
                                <i className="fas fa-rocket me-2"></i>
                                Get Started
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Features Section */}
            <Container className="mb-5">
                <Row className="mb-4">
                    <Col>
                        <h2 className="text-center mb-5 fw-bold">Platform Features</h2>
                    </Col>
                </Row>
                <Row>
                    <Col lg={4} md={6} className="mb-4">
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="fas fa-search fa-3x text-primary"></i>
                                </div>
                                <h5 className="card-title fw-bold mb-3">Stock Screening</h5>
                                <p className="card-text text-muted">
                                    Filter stocks by sector, index, and various financial metrics to find the best investment opportunities.
                                </p>
                                <Link to="/screener" className="btn btn-outline-primary">
                                    <i className="fas fa-arrow-right me-2"></i>
                                    Explore Screener
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="fas fa-briefcase fa-3x text-success"></i>
                                </div>
                                <h5 className="card-title fw-bold mb-3">Portfolio Management</h5>
                                <p className="card-text text-muted">
                                    Build and optimize your investment portfolio with advanced algorithms and risk management tools.
                                </p>
                                <Link to="/portfolio" className="btn btn-outline-success">
                                    <i className="fas fa-arrow-right me-2"></i>
                                    Manage Portfolio
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="fas fa-chart-bar fa-3x text-info"></i>
                                </div>
                                <h5 className="card-title fw-bold mb-3">Market Analysis</h5>
                                <p className="card-text text-muted">
                                    Access comprehensive charts and analysis tools to make informed investment decisions.
                                </p>
                                <Link to="/chart" className="btn btn-outline-info">
                                    <i className="fas fa-arrow-right me-2"></i>
                                    View Charts
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="fas fa-rocket fa-3x text-warning"></i>
                                </div>
                                <h5 className="card-title fw-bold mb-3">Advanced Portfolio</h5>
                                <p className="card-text text-muted">
                                    Use cutting-edge optimization algorithms including Markowitz, Risk Parity, and more.
                                </p>
                                <Link to="/advanced-portfolio" className="btn btn-outline-warning">
                                    <i className="fas fa-arrow-right me-2"></i>
                                    Advanced Tools
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="fas fa-shield-alt fa-3x text-danger"></i>
                                </div>
                                <h5 className="card-title fw-bold mb-3">Risk Management</h5>
                                <p className="card-text text-muted">
                                    Comprehensive risk assessment and management tools to protect your investments.
                                </p>
                                <Link to="/portfolio" className="btn btn-outline-danger">
                                    <i className="fas fa-arrow-right me-2"></i>
                                    Risk Tools
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} md={6} className="mb-4">
                        <Card className="h-100 feature-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="fas fa-clock fa-3x text-primary"></i>
                                </div>
                                <h5 className="card-title fw-bold mb-3">Real-time Data</h5>
                                <p className="card-text text-muted">
                                    Get real-time market data and insights to stay ahead of market movements.
                                </p>
                                <Link to="/screener" className="btn btn-outline-primary">
                                    <i className="fas fa-arrow-right me-2"></i>
                                    Live Data
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Stats Section */}
            <div className="stats-section py-5 mb-5">
                <Container>
                    <Row className="text-center">
                        <Col md={3} className="mb-4">
                            <div className="stat-item">
                                <h3 className="fw-bold text-primary mb-2">500+</h3>
                                <p className="text-muted mb-0">Stocks Analyzed</p>
                            </div>
                        </Col>
                        <Col md={3} className="mb-4">
                            <div className="stat-item">
                                <h3 className="fw-bold text-success mb-2">10+</h3>
                                <p className="text-muted mb-0">Sectors Covered</p>
                            </div>
                        </Col>
                        <Col md={3} className="mb-4">
                            <div className="stat-item">
                                <h3 className="fw-bold text-info mb-2">5+</h3>
                                <p className="text-muted mb-0">Optimization Algorithms</p>
                            </div>
                        </Col>
                        <Col md={3} className="mb-4">
                            <div className="stat-item">
                                <h3 className="fw-bold text-warning mb-2">24/7</h3>
                                <p className="text-muted mb-0">Data Updates</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Subscribe Section */}
            <Container className="mb-5">
                <Row>
                    <Col lg={8} className="mx-auto">
                        <Card className="subscribe-card">
                            <Card.Body className="text-center p-5">
                                <div className="subscribe-icon mb-4">
                                    <i className="fas fa-envelope fa-3x text-primary"></i>
                                </div>
                                <h4 className="card-title fw-bold mb-3">Stay Updated</h4>
                                <p className="card-text text-muted mb-4">
                                    Subscribe to our newsletter for the latest market insights, portfolio tips, and platform updates.
                                </p>
                                <Form onSubmit={handleSubscribe} className="d-flex justify-content-center flex-wrap">
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={subscribeEmail}
                                        onChange={(e) => setSubscribeEmail(e.target.value)}
                                        className="me-2 mb-2"
                                        style={{ maxWidth: '300px' }}
                                        required
                                    />
                                    <Button type="submit" variant="primary" disabled={subscribeLoading} className="mb-2">
                                        {subscribeLoading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin me-2"></i>
                                                Subscribing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Subscribe
                                            </>
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
};

export default Home; 