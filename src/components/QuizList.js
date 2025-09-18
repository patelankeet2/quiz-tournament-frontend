import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { quizService } from '../services/quizService';

const QuizList = ({ onEdit, onView, refreshTrigger }) => {
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
      setQuizzes(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      setError('Failed to fetch quizzes: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching quizzes:', error);
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
          <span className="visually-hidden">Loading quizzes...</span>
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
              <th>Start Date</th>
              <th>End Date</th>
              <th>Min Passing %</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(quiz => (
              <tr key={quiz.id}>
                <td>
                  <Button 
                    variant="link" 
                    className="p-0 text-decoration-none" 
                    onClick={() => onView(quiz)}
                  >
                    {quiz.name || 'Unnamed Quiz'}
                  </Button>
                </td>
                <td>{quiz.category || 'Unknown'}</td>
                <td>{getDifficultyBadge(quiz.difficulty)}</td>
                <td>{quiz.startDate ? new Date(quiz.startDate).toLocaleDateString() : 'N/A'}</td>
                <td>{quiz.endDate ? new Date(quiz.endDate).toLocaleDateString() : 'N/A'}</td>
                <td>{quiz.minPassingPercentage || 'N/A'}%</td>
                <td>{getStatusBadge(quiz)}</td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => onView(quiz)}
                    title="View Details"
                  >
                    <i className="bi bi-eye"></i>
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(quiz)}
                    title="Edit Quiz"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setDeleteConfirm(quiz)}
                    title="Delete Quiz"
                  >
                    <i className="bi bi-trash"></i>
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