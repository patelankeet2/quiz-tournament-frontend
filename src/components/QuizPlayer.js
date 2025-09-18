import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, ProgressBar, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';

const QuizPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    startQuiz();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && attemptId && !quizCompleted) {
      handleAnswerSubmit();
    }
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const attemptData = await quizService.startQuizAttempt(id);
      
      if (attemptData.attemptId) {
        setAttemptId(attemptData.attemptId);
        
        // Get quiz details
        const quizDetails = await quizService.getQuizQuestions(id);
        setQuiz(quizDetails);
        setTotalQuestions(quizDetails.length || 10); // Default to 10 if not specified
        
        // Set time limit (default 10 minutes if not specified)
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
        setError('Failed to start quiz: No attempt ID received');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to start quiz: ' + (error.response?.data?.error || 'Unknown error'));
      if (error.response?.status === 400) {
        setError('You have already completed this quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    try {
      const questionData = await quizService.getAttemptQuestion(attemptId);
      setCurrentQuestion(questionData);
      setSelectedAnswer('');
    } catch (error) {
      if (error.response?.status === 404) {
        // No more questions, quiz completed
        completeQuiz();
      } else {
        setError('Failed to load question');
        console.error('Error loading question:', error);
      }
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer && timeLeft > 0) {
      setError('Please select an answer');
      return;
    }

    try {
      const result = await quizService.submitAnswer(attemptId, selectedAnswer);
      
      if (result.correct) {
        setScore(prev => prev + 1);
      }
      
      // Check if there are more questions or quiz is completed
      if (questionIndex < totalQuestions - 1) {
        setQuestionIndex(prev => prev + 1);
        await loadNextQuestion();
      } else {
        completeQuiz();
      }
    } catch (error) {
      setError('Failed to submit answer');
      console.error('Error submitting answer:', error);
    }
  };

  const completeQuiz = () => {
    if (timer) clearInterval(timer);
    setQuizCompleted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <p>Loading quiz...</p>
      </Container>
    );
  }

  if (error && !quizCompleted) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/player')}>Back to Dashboard</Button>
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
            </Col>
            <Col xs="auto">
              <h4>Time: {formatTime(timeLeft)}</h4>
            </Col>
          </Row>
          <ProgressBar 
            now={((questionIndex + 1) / totalQuestions) * 100} 
            className="mt-2" 
          />
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {currentQuestion && (
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
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Card.Body>
        
        <Card.Footer className="text-center">
          <Button 
            size="lg" 
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer}
          >
            {questionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default QuizPlayer;