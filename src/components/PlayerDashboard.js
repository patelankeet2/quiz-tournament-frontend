import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { QUIZ_CATEGORIES } from '../utils/constants';

const PlayerDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchPlayerStats();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, categoryFilter]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getQuizStatus();
      
      // Combine all quizzes from different statuses
      let allQuizzes = [];
      if (data.ongoing) allQuizzes = [...allQuizzes, ...data.ongoing];
      if (data.upcoming) allQuizzes = [...allQuizzes, ...data.upcoming];
      if (data.past) allQuizzes = [...allQuizzes, ...data.past];
      
      setQuizzes(allQuizzes);
      setError('');
    } catch (error) {
      setError('Failed to fetch quizzes');
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerStats = async () => {
    try {
      const historyData = await quizService.getQuizHistory();
      const historyArray = Array.isArray(historyData) ? historyData : [];
      
      const totalScore = historyArray.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
      const averageScore = historyArray.length > 0 ? (totalScore / historyArray.length) : 0;
      const passedQuizzes = historyArray.filter(attempt => attempt.passed).length;
      
      setStats({
        totalAttempts: historyArray.length,
        averageScore: averageScore.toFixed(1),
        completedQuizzes: historyArray.length,
        passedQuizzes: passedQuizzes,
        successRate: historyArray.length > 0 ? ((passedQuizzes / historyArray.length) * 100).toFixed(1) : 0
      });
    } catch (error) {
      console.error('Error fetching player stats:', error);
      setStats({
        totalAttempts: 0,
        averageScore: 0,
        completedQuizzes: 0,
        passedQuizzes: 0,
        successRate: 0
      });
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];
    
    if (categoryFilter) {
      filtered = filtered.filter(quiz => quiz.category === categoryFilter);
    }
    
    setFilteredQuizzes(filtered);
  };

  const handlePlayQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      Easy: 'success',
      Medium: 'warning',
      Hard: 'danger',
      easy: 'success',
      medium: 'warning',
      hard: 'danger'
    };
    return <Badge bg={variants[difficulty] || 'secondary'}>{difficulty}</Badge>;
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
    
    if (startDate && endDate) {
      if (now < startDate) {
        return { status: 'upcoming', variant: 'info' };
      } else if (now > endDate) {
        return { status: 'ended', variant: 'secondary' };
      } else {
        return { status: 'active', variant: 'success' };
      }
    }
    
    return { status: 'available', variant: 'success' };
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading quizzes...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Player Dashboard</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Player Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Attempts</Card.Title>
              <Card.Text className="h3">{stats.totalAttempts || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Average Score</Card.Title>
              <Card.Text className="h3">{stats.averageScore || 0}%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Completed Quizzes</Card.Title>
              <Card.Text className="h3">{stats.completedQuizzes || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Success Rate</Card.Title>
              <Card.Text className="h3">{stats.successRate || 0}%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Overview */}
      {stats.completedQuizzes > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Progress Overview</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Quizzes Passed:</strong> {stats.passedQuizzes} / {stats.completedQuizzes}
                </div>
                <ProgressBar now={(stats.passedQuizzes / stats.completedQuizzes) * 100} 
                            label={`${((stats.passedQuizzes / stats.completedQuizzes) * 100).toFixed(1)}%`} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filter Section */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {QUIZ_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          <Button variant="outline-secondary" onClick={fetchQuizzes}>
            <i className="bi bi-arrow-clockwise"></i> Refresh Quizzes
          </Button>
        </Col>
      </Row>

      {/* Quizzes Grid */}
      <Row>
        {filteredQuizzes.map(quiz => {
          const status = getQuizStatus(quiz);
          return (
            <Col md={6} lg={4} key={quiz.id} className="mb-4">
              <Card className="h-100 quiz-card">
                <Card.Header>
                  <Badge bg={status.variant} className="float-end">
                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Card.Title>{quiz.name || 'Unnamed Quiz'}</Card.Title>
                  <Card.Text>
                    <strong>Category:</strong> {quiz.category || 'Unknown'}<br />
                    <strong>Difficulty:</strong> {getDifficultyBadge(quiz.difficulty)}<br />
                    {quiz.startDate && (
                      <><strong>Start Date:</strong> {new Date(quiz.startDate).toLocaleDateString()}<br /></>
                    )}
                    {quiz.endDate && (
                      <><strong>End Date:</strong> {new Date(quiz.endDate).toLocaleDateString()}<br /></>
                    )}
                  </Card.Text>
                </Card.Body>
                <Card.Footer>
                  <Button 
                    variant="primary" 
                    onClick={() => handlePlayQuiz(quiz.id)}
                    disabled={quiz.participated || status.status !== 'active'}
                    className="w-100"
                  >
                    {quiz.participated ? 'Already Participated' : 
                     status.status === 'upcoming' ? 'Coming Soon' :
                     status.status === 'ended' ? 'Quiz Ended' : 'Play Quiz'}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>

      {filteredQuizzes.length === 0 && !loading && (
        <div className="text-center mt-4">
          <p>No quizzes available. Try changing your filters.</p>
        </div>
      )}
    </Container>
  );
};

export default PlayerDashboard;