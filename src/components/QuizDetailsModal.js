import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { quizService } from '../services/quizService';

const QuizDetailsModal = ({ show, handleClose, quiz }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && quiz) {
      fetchQuizQuestions();
    }
  }, [show, quiz]);

  const fetchQuizQuestions = async () => {
    if (!quiz?.id) return;
    
    setLoading(true);
    setError('');
    try {
      const questionsData = await quizService.getQuizQuestions(quiz.id);
      setQuestions(questionsData);
    } catch (error) {
      setError('Failed to load quiz questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Quiz Details: {quiz?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3">
          <strong>Category:</strong> {quiz?.category} <br />
          <strong>Difficulty:</strong> {getDifficultyBadge(quiz?.difficulty)} <br />
          <strong>Start Date:</strong> {quiz?.startDate ? new Date(quiz.startDate).toLocaleString() : 'N/A'} <br />
          <strong>End Date:</strong> {quiz?.endDate ? new Date(quiz.endDate).toLocaleString() : 'N/A'} <br />
          <strong>Min Passing Percentage:</strong> {quiz?.minPassingPercentage}%
        </div>

        <h5>Questions ({questions.length})</h5>
        
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading questions...</span>
            </Spinner>
          </div>
        ) : questions.length === 0 ? (
          <Alert variant="info">No questions available for this quiz.</Alert>
        ) : (
          <ListGroup variant="flush">
            {questions.map((question, index) => (
              <ListGroup.Item key={index} className="mb-3">
                <h6 className="mb-2">Question {index + 1}: {question.questionText}</h6>
                <div className="mb-2">
                  <strong>Choices:</strong>
                  <ul className="mb-1">
                    {question.choices?.map((choice, choiceIndex) => (
                      <li key={choiceIndex}>{choice}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-success">Correct Answer:</strong> {question.correctAnswer}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QuizDetailsModal;