import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <Container>
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="mt-5">
                            <Card.Body className="text-center">
                                <h4>Please log in to view your profile</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="mt-5">
                        <Card.Header as="h4" className="text-center">
                            Welcome, {user.name}!
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <h5>Profile Information</h5>
                                    <p><strong>Name:</strong> {user.name}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>User ID:</strong> {user.id}</p>
                                </Col>
                                <Col md={6}>
                                    <h5>Quick Actions</h5>
                                    <ul className="list-unstyled">
                                        <li><a href="/screener" className="text-decoration-none">View Stock Screener</a></li>
                                        <li><a href="/portfolio" className="text-decoration-none">Manage Portfolio</a></li>
                                        <li><a href="/chart" className="text-decoration-none">View Charts</a></li>
                                    </ul>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile; 