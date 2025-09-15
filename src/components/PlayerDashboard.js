import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
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
      
      // Handle different response structures
      let quizzesData = [];
      
      if (Array.isArray(data)) {
        // If the response is already an array
        quizzesData = data;
      } else if (data && typeof data === 'object') {
        // If the response is an object with nested arrays
        if (data.ongoing && Array.isArray(data.ongoing)) {
          quizzesData = [...quizzesData, ...data.ongoing];
        }
        if (data.upcoming && Array.isArray(data.upcoming)) {
          quizzesData = [...quizzesData, ...data.upcoming];
        }
        if (data.past && Array.isArray(data.past)) {
          quizzesData = [...quizzesData, ...data.past];
        }
        // If it's a single object with quizzes property
        if (data.quizzes && Array.isArray(data.quizzes)) {
          quizzesData = data.quizzes;
        }
      }
      
      setQuizzes(quizzesData);
      setError('');
    } catch (error) {
      setError('Failed to fetch quizzes');
      console.error('Error fetching quizzes:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerStats = async () => {
    try {
      const data = await quizService.getQuizHistory();
      const historyData = Array.isArray(data) ? data : [];
      
      setStats({
        totalAttempts: historyData.length,
        averageScore: historyData.length > 0 
          ? (historyData.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / historyData.length).toFixed(1)
          : 0,
        completedQuizzes: historyData.filter(attempt => attempt.completed).length
      });
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const filterQuizzes = () => {
    let filtered = Array.isArray(quizzes) ? [...quizzes] : [];
    
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
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Attempts</Card.Title>
              <Card.Text className="h3">{stats.totalAttempts || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Average Score</Card.Title>
              <Card.Text className="h3">{stats.averageScore || 0}%</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Completed Quizzes</Card.Title>
              <Card.Text className="h3">{stats.completedQuizzes || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
            Refresh Quizzes
          </Button>
        </Col>
      </Row>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert variant="info" className="mb-3">
          <strong>Debug Info:</strong> Found {filteredQuizzes.length} quizzes
          <br />
          <small>Quizzes data type: {Array.isArray(quizzes) ? 'Array' : typeof quizzes}</small>
        </Alert>
      )}

      {/* Quizzes Grid */}
      <Row>
        {Array.isArray(filteredQuizzes) && filteredQuizzes.map(quiz => (
          <Col md={6} lg={4} key={quiz.id} className="mb-4">
            <Card className="h-100 quiz-card">
              <Card.Body>
                <Card.Title>{quiz.name || 'Unnamed Quiz'}</Card.Title>
                <Card.Text>
                  <strong>Category:</strong> {quiz.category || 'Unknown'}<br />
                  <strong>Difficulty:</strong> {getDifficultyBadge(quiz.difficulty)}<br />
                  <strong>Time Limit:</strong> {quiz.timeLimit || 'Unknown'} minutes<br />
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
                  disabled={quiz.participated}
                >
                  {quiz.participated ? 'Already Participated' : 'Play Quiz'}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {Array.isArray(filteredQuizzes) && filteredQuizzes.length === 0 && !loading && (
        <div className="text-center mt-4">
          <p>No quizzes available. Try changing your filters.</p>
        </div>
      )}
    </Container>
  );
};

export default PlayerDashboard;