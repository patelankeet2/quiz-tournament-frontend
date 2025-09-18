import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Tab, Tabs, Spinner } from 'react-bootstrap';
import QuizForm from './QuizForm';
import QuizList from './QuizList';
import UserManagement from './UserManagement';
import { quizService } from '../services/quizService';

const AdminDashboard = () => {
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('quizzes');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAdminStats();
      setStats(data);
      setError('');
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics: ' + (error.response?.data?.error || 'Please check your connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      await quizService.createQuiz(quizData);
      setRefreshTrigger(prev => prev + 1);
      setError('');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create quiz';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const handleUpdateQuiz = async (quizData) => {
    try {
      await quizService.updateQuiz(editingQuiz.id, quizData);
      setRefreshTrigger(prev => prev + 1);
      setError('');
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update quiz';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setShowQuizForm(true);
  };

  const handleCloseQuizForm = () => {
    setShowQuizForm(false);
    setEditingQuiz(null);
    setError('');
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Admin Dashboard</h1>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

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

      {/* Tab Navigation */}
      <Tabs
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        className="mb-3"
      >
        <Tab eventKey="quizzes" title="Quiz Management">
          {/* Quiz Management Section */}
          <Row className="mb-3">
            <Col>
              <Button 
                variant="primary" 
                onClick={() => setShowQuizForm(true)}
                className="me-2"
              >
                Create New Quiz
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                Refresh Quizzes
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <QuizList 
                onEdit={handleEditQuiz} 
                refreshTrigger={refreshTrigger} 
              />
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="users" title="User Management">
          <UserManagement />
        </Tab>
      </Tabs>

      {/* Quiz Form Modal */}
      <QuizForm
        show={showQuizForm}
        handleClose={handleCloseQuizForm}
        quiz={editingQuiz}
        onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}
        mode={editingQuiz ? 'edit' : 'create'}
      />
    </Container>
  );
};

export default AdminDashboard;