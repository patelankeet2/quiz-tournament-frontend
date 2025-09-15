import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { quizService } from '../services/quizService';

const QuizList = ({ onEdit, refreshTrigger }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [refreshTrigger]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      
      // Handle different response structures
      let quizzesData = [];
      
      if (Array.isArray(data)) {
        // If the response is already an array
        quizzesData = data;
      } else if (data && typeof data === 'object') {
        // If the response is an object, try to extract quizzes from different possible properties
        if (data.quizzes && Array.isArray(data.quizzes)) {
          quizzesData = data.quizzes;
        } else if (data.content && Array.isArray(data.content)) {
          quizzesData = data.content;
        } else if (data.data && Array.isArray(data.data)) {
          quizzesData = data.data;
        } else {
          // If it's a plain object, convert it to an array
          quizzesData = Object.values(data);
        }
      }
      
      // Ensure we always have an array
      if (!Array.isArray(quizzesData)) {
        quizzesData = [];
      }
      
      setQuizzes(quizzesData);
      setError('');
    } catch (error) {
      setError('Failed to fetch quizzes: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching quizzes:', error);
      console.error('Error response data:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await quizService.deleteQuiz(id);
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      setError('Failed to delete quiz: ' + (error.response?.data?.message || error.message));
      console.error('Error deleting quiz:', error);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    if (!difficulty) return <Badge bg="secondary">Unknown</Badge>;
    
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

  const getStatusBadge = (quiz) => {
    if (quiz.isPublic === false) {
      return <Badge bg="secondary">Private</Badge>;
    }
    
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
    
    if (startDate && endDate) {
      if (now < startDate) {
        return <Badge bg="info">Upcoming</Badge>;
      } else if (now > endDate) {
        return <Badge bg="secondary">Ended</Badge>;
      } else {
        return <Badge bg="success">Active</Badge>;
      }
    }
    
    return <Badge bg="success">Public</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <Button variant="outline-danger" size="sm" onClick={fetchQuizzes}>
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert variant="info" className="mb-3">
          <strong>Debug Info:</strong> Found {quizzes.length} quizzes
          <br />
          <small>Quizzes data type: {Array.isArray(quizzes) ? 'Array' : typeof quizzes}</small>
          {quizzes.length > 0 && (
            <small>
              <br />First quiz keys: {Object.keys(quizzes[0]).join(', ')}
            </small>
          )}
        </Alert>
      )}

      {quizzes.length === 0 ? (
        <Alert variant="info">
          No quizzes found. Create your first quiz to get started.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Time Limit</th>
              <th>Max Attempts</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(quiz => (
              <tr key={quiz.id}>
                <td>{quiz.name || 'Unnamed Quiz'}</td>
                <td>{quiz.category || 'Unknown'}</td>
                <td>{getDifficultyBadge(quiz.difficulty)}</td>
                <td>{quiz.timeLimit || quiz.minutes || 'N/A'} minutes</td>
                <td>{quiz.maxAttempts || 1}</td>
                <td>{getStatusBadge(quiz)}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(quiz)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setDeleteConfirm(quiz)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the quiz "{deleteConfirm?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuizList;