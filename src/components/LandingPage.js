import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section text-center text-white">
        <Container>
          <h1 className="display-4 fw-bold mb-4">Welcome to Quiz Tournament</h1>
          <p className="lead mb-4">Test your knowledge, challenge your friends, and climb the leaderboard!</p>
          <Button 
            variant="primary" 
            size="lg" 
            className="me-3"
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
          <Button 
            variant="outline-light" 
            size="lg"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="my-5">
        <h2 className="text-center mb-5">Why Choose Quiz Tournament?</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center feature-card">
              <Card.Body>
                <div className="feature-icon mb-3">📊</div>
                <Card.Title>Multiple Categories</Card.Title>
                <Card.Text>
                  Choose from various categories including Science, History, Entertainment, and more.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center feature-card">
              <Card.Body>
                <div className="feature-icon mb-3">🏆</div>
                <Card.Title>Compete & Win</Card.Title>
                <Card.Text>
                  Participate in tournaments, earn achievements, and climb the leaderboard.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center feature-card">
              <Card.Body>
                <div className="feature-icon mb-3">⏱️</div>
                <Card.Title>Timed Challenges</Card.Title>
                <Card.Text>
                  Test your knowledge under pressure with timed quizzes and challenges.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* How It Works Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div className="step-number">1</div>
              <h5>Create Account</h5>
              <p>Sign up as a player or administrator</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="step-number">2</div>
              <h5>Take Quizzes</h5>
              <p>Select from available quizzes and test your knowledge</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="step-number">3</div>
              <h5>Track Progress</h5>
              <p>View your scores, achievements, and ranking</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="step-number">4</div>
              <h5>Compete</h5>
              <p>Challenge others and climb the leaderboard</p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;