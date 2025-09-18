import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Alert, ProgressBar, Row, Col, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';

const QuizPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use useRef to persist the attemptId across re-renders
  const attemptIdRef = useRef(null);
  const [attemptId, setAttemptId] = useState(() => {
    // Try to get attemptId from sessionStorage on component mount
    const savedAttemptId = sessionStorage.getItem(`quizAttempt_${id}`);
    return savedAttemptId ? parseInt(savedAttemptId) : null;
  });
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timer, setTimer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Keep the ref in sync with the state
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  // Save attemptId to sessionStorage whenever it changes
  useEffect(() => {
    if (attemptId) {
      sessionStorage.setItem(`quizAttempt_${id}`, attemptId.toString());
    } else {
      sessionStorage.removeItem(`quizAttempt_${id}`);
    }
  }, [attemptId, id]);

  useEffect(() => {
    startQuiz();
    return () => {
      if (timer) clearInterval(timer);
      // Clean up on component unmount
      sessionStorage.removeItem(`quizAttempt_${id}`);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && attemptIdRef.current && !quizCompleted) {
      handleAnswerSubmit();
    }
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Starting quiz with ID:', id);
      
      // If we already have an attemptId from sessionStorage, use it
      if (attemptId) {
        console.log('Resuming existing attempt:', attemptId);
        attemptIdRef.current = attemptId;
        await loadQuizDetails();
        await loadNextQuestion();
        return;
      }
      
      // Start a new quiz attempt
      console.log('Starting new quiz attempt...');
      const attemptData = await quizService.startQuizAttempt(id);
      console.log('Quiz start response:', attemptData);
      
      // The backend returns: { "message": "resumed", "attemptId": 5 }
      if (attemptData.attemptId) {
        const newAttemptId = attemptData.attemptId;
        setAttemptId(newAttemptId);
        attemptIdRef.current = newAttemptId;
        console.log('Attempt ID set to:', newAttemptId);
        
        await loadQuizDetails();
        
        // Set time limit (default 10 minutes)
        setTimeLeft(10 * 60);
        
        // Start timer
        const quizTimer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(quizTimer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimer(quizTimer);
        
        // Load first question
        await loadNextQuestion();
      } else {
        const errorMsg = 'Failed to start quiz: No attempt ID received. Response: ' + JSON.stringify(attemptData);
        console.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      let errorMessage = 'Failed to start quiz: ';
      
      if (error.response?.status === 400) {
        errorMessage += 'You have already completed this quiz or it has not started yet.';
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizDetails = async () => {
    try {
      const quizDetails = await quizService.getQuizQuestions(id);
      setQuiz(quizDetails);
      setTotalQuestions(quizDetails.length || 10);
      console.log('Quiz details loaded. Total questions:', quizDetails.length || 10);
    } catch (error) {
      console.error('Error loading quiz details:', error);
      setError('Failed to load quiz details: ' + (error.response?.data?.error || 'Please try again.'));
    }
  };

  const loadNextQuestion = async () => {
    const currentAttemptId = attemptIdRef.current;
    
    if (!currentAttemptId) {
      const errorMsg = 'No attempt ID available. Cannot load question.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      console.log('Loading question for attempt:', currentAttemptId);
      const questionData = await quizService.getAttemptQuestion(currentAttemptId);
      console.log('Question loaded:', questionData);
      setCurrentQuestion(questionData);
      setSelectedAnswer('');
      setError('');
    } catch (error) {
      console.error('Error loading question:', error);
      
      if (error.response?.status === 404) {
        // No more questions, quiz completed
        console.log('No more questions. Quiz completed.');
        completeQuiz();
      } else if (error.response?.data?.error) {
        setError('Failed to load question: ' + error.response.data.error);
      } else {
        setError('Failed to load question. Please try again.');
      }
    }
  };

  const handleAnswerSubmit = async () => {
    const currentAttemptId = attemptIdRef.current;
    
    if (!currentAttemptId) {
      const errorMsg = 'No attempt ID available. Cannot submit answer. Current ref: ' + attemptIdRef.current;
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!selectedAnswer && timeLeft > 0) {
      setError('Please select an answer');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('Submitting answer:', selectedAnswer, 'for attempt:', currentAttemptId);
      const result = await quizService.submitAnswer(currentAttemptId, selectedAnswer);
      console.log('Answer submission result:', result);
      
      if (result.correct) {
        setScore(prev => prev + 1);
      }
      
      // Check if there are more questions or quiz is completed
      if (result.completed) {
        console.log('Quiz completed via answer submission');
        completeQuiz();
      } else if (questionIndex < totalQuestions - 1) {
        setQuestionIndex(prev => prev + 1);
        await loadNextQuestion();
      } else {
        console.log('No more questions. Quiz completed.');
        completeQuiz();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit answer: ' + (error.response?.data?.error || 'Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const completeQuiz = () => {
    if (timer) clearInterval(timer);
    setQuizCompleted(true);
    // Clean up session storage
    sessionStorage.removeItem(`quizAttempt_${id}`);
    attemptIdRef.current = null;
    setAttemptId(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restartQuiz = () => {
    // Clear the attempt and restart
    attemptIdRef.current = null;
    setAttemptId(null);
    sessionStorage.removeItem(`quizAttempt_${id}`);
    setLoading(true);
    setError('');
    setQuizCompleted(false);
    setQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setCurrentQuestion(null);
    startQuiz();
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Starting quiz...</p>
      </Container>
    );
  }

  if (error && !quizCompleted) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button onClick={() => navigate('/player')} className="me-2">
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={restartQuiz}>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (quizCompleted) {
    return (
      <Container className="mt-4">
        <Card>
          <Card.Header className="text-center">
            <h2>Quiz Completed!</h2>
          </Card.Header>
          <Card.Body className="text-center">
            <h3>Your Score: {score} / {totalQuestions}</h3>
            <p>Percentage: {((score / totalQuestions) * 100).toFixed(1)}%</p>
            <Button onClick={() => navigate('/player')}>Back to Dashboard</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h3>{quiz?.name || 'Quiz'}</h3>
              <p className="mb-0">Question {questionIndex + 1} of {totalQuestions}</p>
              <small>Attempt ID: {attemptIdRef.current}</small>
            </Col>
            <Col xs="auto">
              <h4>Time: {formatTime(timeLeft)}</h4>
            </Col>
          </Row>
          <ProgressBar 
            now={((questionIndex + 1) / totalQuestions) * 100} 
            className="mt-2" 
            label={`${Math.round(((questionIndex + 1) / totalQuestions) * 100)}%`}
          />
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {currentQuestion ? (
            <>
              <h4 className="mb-4">{currentQuestion.questionText}</h4>
              
              <div className="d-grid gap-2">
                {currentQuestion.choices && currentQuestion.choices.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === option ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedAnswer(option)}
                    size="lg"
                    className="text-start"
                    disabled={submitting}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading question...</span>
              </Spinner>
              <p className="mt-2">Loading question...</p>
            </div>
          )}
        </Card.Body>
        
        <Card.Footer className="text-center">
          <Button 
            size="lg" 
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer || submitting}
          >
            {submitting ? 'Submitting...' : 
             questionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default QuizPlayer;