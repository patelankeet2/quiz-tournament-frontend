import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import QuizForm from './QuizForm';
import QuizList from './QuizList';
import QuizDetailsModal from './QuizDetailsModal';
import { quizService } from '../services/quizService';

const AdminDashboard = () => {
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const data = await quizService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      await quizService.createQuiz(quizData);
      setRefreshTrigger(prev => prev + 1);
      setSuccess('Quiz created successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create quiz');
      throw error;
    }
  };

  const handleUpdateQuiz = async (quizData) => {
    try {
      await quizService.updateQuiz(editingQuiz.id, quizData);
      setRefreshTrigger(prev => prev + 1);
      setSuccess('Quiz updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update quiz');
      throw error;
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setShowQuizForm(true);
  };

  const handleViewQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizDetails(true);
  };

  const handleCloseQuizForm = () => {
    setShowQuizForm(false);
    setEditingQuiz(null);
  };

  const handleCloseQuizDetails = () => {
    setShowQuizDetails(false);
    setSelectedQuiz(null);
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Admin Dashboard</h1>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Quizzes</Card.Title>
              <Card.Text className="h3">{stats.totalQuizzes || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Active Quizzes</Card.Title>
              <Card.Text className="h3">{stats.activeQuizzes || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Players</Card.Title>
              <Card.Text className="h3">{stats.totalPlayers || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Attempts</Card.Title>
              <Card.Text className="h3">{stats.totalAttempts || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quiz Management Section */}
      <Row className="mb-3">
        <Col>
          <Button 
            variant="primary" 
            onClick={() => setShowQuizForm(true)}
            className="me-2"
          >
            <i className="bi bi-plus-circle"></i> Create New Quiz
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <QuizList 
            onEdit={handleEditQuiz}
            onView={handleViewQuiz}
            refreshTrigger={refreshTrigger} 
          />
        </Col>
      </Row>

      {/* Quiz Form Modal */}
      <QuizForm
        show={showQuizForm}
        handleClose={handleCloseQuizForm}
        quiz={editingQuiz}
        onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}
        mode={editingQuiz ? 'edit' : 'create'}
      />

      {/* Quiz Details Modal */}
      <QuizDetailsModal
        show={showQuizDetails}
        handleClose={handleCloseQuizDetails}
        quiz={selectedQuiz}
      />
    </Container>
  );
};

export default AdminDashboard;