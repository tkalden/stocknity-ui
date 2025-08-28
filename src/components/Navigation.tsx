import React, { useState } from 'react';
import { Button, Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CacheStatusBadge from './CacheStatusBadge';

const Navigation: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setShowOffcanvas(false);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const isAdmin = user?.is_admin || user?.email === 'admin@stocknity.com'; // Check both ways for admin

    const handleNavClick = () => {
        setShowOffcanvas(false);
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
                <Container>
                    {/* Brand/Home - Always visible */}
                    <Navbar.Brand as={Link} to="/" className="me-4">
                        <i className="fas fa-chart-line me-2"></i>
                        <span className="fw-bold">Stocknity</span>
                    </Navbar.Brand>

                    {/* Hamburger Menu Button */}
                    <Button
                        variant="outline-light"
                        onClick={() => setShowOffcanvas(true)}
                        className="d-lg-none"
                        style={{ border: 'none', background: 'transparent' }}
                    >
                        <i className="fas fa-bars"></i>
                    </Button>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
                        <Nav className="me-auto">
                            <Nav.Link
                                as={Link}
                                to="/screener"
                                className={`me-2 ${isActive('/screener') ? 'active' : ''}`}
                            >
                                <i className="fas fa-search me-1"></i>
                                Screener
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/chart"
                                className={`me-2 ${isActive('/chart') ? 'active' : ''}`}
                            >
                                <i className="fas fa-chart-bar me-1"></i>
                                Charts
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/ai-analysis"
                                className={`me-2 ${isActive('/ai-analysis') ? 'active' : ''}`}
                            >
                                <i className="fas fa-robot me-1"></i>
                                AI Analysis
                            </Nav.Link>
                            {isAuthenticated && (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to="/portfolio"
                                        className={`me-2 ${isActive('/portfolio') ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-briefcase me-1"></i>
                                        Portfolio
                                    </Nav.Link>
                                    <Nav.Link
                                        as={Link}
                                        to="/advanced-portfolio"
                                        className={`me-2 ${isActive('/advanced-portfolio') ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-rocket me-1"></i>
                                        Advanced
                                    </Nav.Link>
                                    {isAdmin && (
                                        <Nav.Link
                                            as={Link}
                                            to="/cache-status"
                                            className={`me-2 ${isActive('/cache-status') ? 'active' : ''}`}
                                        >
                                            <i className="fas fa-database me-1"></i>
                                            Cache Status
                                        </Nav.Link>
                                    )}
                                </>
                            )}
                        </Nav>

                        <Nav className="ms-auto d-flex align-items-center">
                            {isAuthenticated && isAdmin && (
                                <div className="me-3 d-flex align-items-center">
                                    <CacheStatusBadge />
                                </div>
                            )}

                            {isAuthenticated ? (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to="/profile"
                                        className={`me-3 ${isActive('/profile') ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-user me-1"></i>
                                        Profile
                                    </Nav.Link>
                                    <Button
                                        variant="outline-light"
                                        onClick={handleLogout}
                                        className="px-3"
                                    >
                                        <i className="fas fa-sign-out-alt me-1"></i>
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to="/login"
                                        className={`me-3 ${isActive('/login') ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-sign-in-alt me-1"></i>
                                        Login
                                    </Nav.Link>
                                    <Nav.Link
                                        as={Link}
                                        to="/signup"
                                        className={`me-3 ${isActive('/signup') ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-user-plus me-1"></i>
                                        Signup
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Mobile Offcanvas Menu */}
            <Offcanvas
                show={showOffcanvas}
                onHide={() => setShowOffcanvas(false)}
                placement="end"
                className="bg-dark text-light"
            >
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>
                        <i className="fas fa-chart-line me-2"></i>
                        Menu
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        <Nav.Link
                            as={Link}
                            to="/screener"
                            className={`mb-2 ${isActive('/screener') ? 'active' : ''}`}
                            onClick={handleNavClick}
                        >
                            <i className="fas fa-search me-2"></i>
                            Stock Screener
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/chart"
                            className={`mb-2 ${isActive('/chart') ? 'active' : ''}`}
                            onClick={handleNavClick}
                        >
                            <i className="fas fa-chart-bar me-2"></i>
                            Market Charts
                        </Nav.Link>
                        <Nav.Link
                            as={Link}
                            to="/ai-analysis"
                            className={`mb-2 ${isActive('/ai-analysis') ? 'active' : ''}`}
                            onClick={handleNavClick}
                        >
                            <i className="fas fa-robot me-2"></i>
                            AI Analysis
                        </Nav.Link>

                        {isAuthenticated ? (
                            <>
                                <hr className="my-3" />
                                <h6 className="text-muted mb-3">Portfolio</h6>
                                <Nav.Link
                                    as={Link}
                                    to="/portfolio"
                                    className={`mb-2 ${isActive('/portfolio') ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <i className="fas fa-briefcase me-2"></i>
                                    My Portfolio
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/advanced-portfolio"
                                    className={`mb-2 ${isActive('/advanced-portfolio') ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <i className="fas fa-rocket me-2"></i>
                                    Advanced Portfolio
                                </Nav.Link>

                                {isAdmin && (
                                    <>
                                        <hr className="my-3" />
                                        <h6 className="text-muted mb-3">Admin</h6>
                                        <Nav.Link
                                            as={Link}
                                            to="/cache-status"
                                            className={`mb-2 ${isActive('/cache-status') ? 'active' : ''}`}
                                            onClick={handleNavClick}
                                        >
                                            <i className="fas fa-database me-2"></i>
                                            Cache Status
                                        </Nav.Link>
                                        <div className="mb-3">
                                            <CacheStatusBadge />
                                        </div>
                                    </>
                                )}

                                <hr className="my-3" />
                                <h6 className="text-muted mb-3">Account</h6>
                                <Nav.Link
                                    as={Link}
                                    to="/profile"
                                    className={`mb-2 ${isActive('/profile') ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <i className="fas fa-user me-2"></i>
                                    Profile
                                </Nav.Link>
                                <Button
                                    variant="outline-light"
                                    onClick={handleLogout}
                                    className="w-100"
                                >
                                    <i className="fas fa-sign-out-alt me-2"></i>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <hr className="my-3" />
                                <h6 className="text-muted mb-3">Account</h6>
                                <Nav.Link
                                    as={Link}
                                    to="/login"
                                    className={`mb-2 ${isActive('/login') ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Login
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/signup"
                                    className={`mb-2 ${isActive('/signup') ? 'active' : ''}`}
                                    onClick={handleNavClick}
                                >
                                    <i className="fas fa-user-plus me-2"></i>
                                    Sign Up
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default Navigation; 