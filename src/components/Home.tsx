import axios from 'axios';
import React, { useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { usePriceWebSocket } from '../hooks/usePriceWebSocket';

function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const minutes = et.getHours() * 60 + et.getMinutes();
  return minutes >= 570 && minutes < 960; // 9:30 AM–4:00 PM ET
}

const TickerTape: React.FC = () => {
  const { prices } = usePriceWebSocket();
  const baseRef = useRef<Record<string, number>>({});

  if (!isMarketOpen()) return null;

  const entries = Object.entries(prices);
  if (entries.length === 0) return null;

  const items = entries.map(([sym, price]) => {
    if (!(sym in baseRef.current)) baseRef.current[sym] = price;
    const base = baseRef.current[sym];
    const chgPct = base > 0 ? ((price - base) / base) * 100 : 0;
    const up = chgPct >= 0;
    return {
      sym,
      price: price.toFixed(2),
      chg: `${up ? '+' : ''}${chgPct.toFixed(2)}%`,
      up,
    };
  });

  const doubled = [...items, ...items];

  return (
    <div className="sn-ticker-wrapper">
      <div className="sn-ticker-strip">
        {doubled.map((t, i) => (
          <span key={i} className="sn-ticker-item">
            <span className="sn-ticker-sym">{t.sym}</span>
            <span className="sn-ticker-price">{t.price}</span>
            <span className={`sn-ticker-chg ${t.up ? 'up' : 'down'}`}>{t.chg}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeLoading(true);
    try {
      await axios.post(API_ENDPOINTS.SUBSCRIBE, { email: subscribeEmail }, {
        headers: { 'Content-Type': 'application/json' },
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
      <TickerTape />

      {/* Hero */}
      <div className="sn-hero">
        <Container>
          <span className="sn-eyebrow">Market intelligence · For everyone</span>
          <h1 className="sn-headline">
            Invest with<br />
            <em>precision.</em>
          </h1>
          <p className="sn-sub">
            Two modes. One platform. Buffett-style fundamentals for beginners,
            quantitative portfolio optimization for professionals.
          </p>
          <div className="sn-hero-actions">
            <Link to="/signup" className="sn-btn-primary">Get started</Link>
            <Link to="/screener" className="sn-btn-ghost">Browse stocks</Link>
          </div>
        </Container>
      </div>

      {/* Modes */}
      <div className="sn-modes">
        <Container>
          <span className="sn-section-label">Choose your approach</span>
          <Row className="g-4 justify-content-center">
            <Col lg={5} md={6}>
              <div className="sn-mode-card beginner">
                <span className="sn-mode-eyebrow beginner">Learn</span>
                <h2 className="sn-mode-title">Beginner Mode</h2>
                <p className="sn-mode-desc">
                  Learn to invest like Buffett, Lynch, and Graham — with
                  AI-powered guidance and built-in guardrails.
                </p>
                <ul className="sn-mode-list">
                  <li>Guru investment strategies</li>
                  <li>AI-powered recommendations</li>
                  <li>Safety guardrails</li>
                  <li>Educational content</li>
                </ul>
                <Link to="/beginner-mode" className="sn-mode-cta">
                  Start learning
                </Link>
              </div>
            </Col>
            <Col lg={5} md={6}>
              <div className="sn-mode-card advanced">
                <span className="sn-mode-eyebrow advanced">Optimize</span>
                <h2 className="sn-mode-title">Advanced Mode</h2>
                <p className="sn-mode-desc">
                  Professional-grade portfolio optimization algorithms —
                  the same methods used by quantitative hedge funds.
                </p>
                <ul className="sn-mode-list">
                  <li>AI portfolio optimization</li>
                  <li>Alternative data sources</li>
                  <li>Risk management tools</li>
                  <li>Professional algorithms</li>
                </ul>
                <Link to="/advanced-mode" className="sn-mode-cta">
                  Go advanced
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Stats */}
      <div className="sn-stats">
        <Container>
          <Row>
            <Col md={3} xs={6} className="mb-3 mb-md-0">
              <div className="sn-stat">
                <span className="sn-stat-num">500+</span>
                <span className="sn-stat-label">Stocks analyzed</span>
              </div>
            </Col>
            <Col md={3} xs={6} className="mb-3 mb-md-0">
              <div className="sn-stat">
                <span className="sn-stat-num">10+</span>
                <span className="sn-stat-label">Sectors covered</span>
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div className="sn-stat">
                <span className="sn-stat-num">5+</span>
                <span className="sn-stat-label">Optimization algorithms</span>
              </div>
            </Col>
            <Col md={3} xs={6}>
              <div className="sn-stat">
                <span className="sn-stat-num">24/7</span>
                <span className="sn-stat-label">Data updates</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Subscribe */}
      <div className="sn-subscribe">
        <Container>
          <div className="sn-subscribe-inner">
            <h2 className="sn-subscribe-title">Stay in the loop.</h2>
            <p className="sn-subscribe-sub">
              Market insights, portfolio tips, and platform updates — no noise.
            </p>
            <form className="sn-subscribe-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="sn-subscribe-input"
                placeholder="your@email.com"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="sn-subscribe-btn"
                disabled={subscribeLoading}
              >
                {subscribeLoading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </Container>
      </div>
    </Container>
  );
};

export default Home;
