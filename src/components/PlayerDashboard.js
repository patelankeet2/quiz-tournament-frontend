import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
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
      setQuizzes(data);
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
      const data = await quizService.getQuizHistory();
      setStats({
        totalAttempts: data.length,
        averageScore: data.length > 0 
          ? (data.reduce((sum, attempt) => sum + attempt.score, 0) / data.length).toFixed(1)
          : 0,
        completedQuizzes: data.filter(attempt => attempt.completed).length
      });
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;
    
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
      Hard: 'danger'
    };
    return <Badge bg={variants[difficulty]}>{difficulty}</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <p>Loading quizzes...</p>
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

      {/* Quizzes Grid */}
      <Row>
        {filteredQuizzes.map(quiz => (
          <Col md={6} lg={4} key={quiz.id} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{quiz.name}</Card.Title>
                <Card.Text>
                  <strong>Category:</strong> {quiz.category}<br />
                  <strong>Difficulty:</strong> {getDifficultyBadge(quiz.difficulty)}<br />
                  <strong>Time Limit:</strong> {quiz.timeLimit} minutes<br />
                  <strong>Questions:</strong> {quiz.questionCount || 'Unknown'}
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <Button 
                  variant="primary" 
                  onClick={() => handlePlayQuiz(quiz.id)}
                  disabled={!quiz.canAttempt}
                >
                  {quiz.canAttempt ? 'Play Quiz' : 'Already Completed'}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
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