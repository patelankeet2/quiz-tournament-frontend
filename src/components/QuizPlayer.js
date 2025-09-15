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
    if (timeLeft === 0 && attemptId) {
      handleAnswerSubmit();
    }
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const attemptData = await quizService.startQuizAttempt(id);
      setAttemptId(attemptData.attemptId);
      setQuiz(attemptData.quiz);
      setTotalQuestions(attemptData.quiz.questions.length);
      setTimeLeft(attemptData.quiz.timeLimit * 60);
      
      // Start timer
      const quizTimer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      setTimer(quizTimer);
      
      // Load first question
      await loadNextQuestion();
    } catch (error) {
      setError('Failed to start quiz: ' + (error.response?.data?.error || 'Unknown error'));
      console.error('Error starting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    try {
      const questionData = await quizService.getAttemptQuestion(attemptId);
      setCurrentQuestion(questionData);
      setSelectedAnswer('');
      setQuestionIndex(prev => prev + 1);
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
      
      if (questionIndex < totalQuestions) {
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
              <h3>{quiz.name}</h3>
              <p className="mb-0">Question {questionIndex} of {totalQuestions}</p>
            </Col>
            <Col xs="auto">
              <h4>Time: {formatTime(timeLeft)}</h4>
            </Col>
          </Row>
          <ProgressBar 
            now={(questionIndex / totalQuestions) * 100} 
            className="mt-2" 
          />
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {currentQuestion && (
            <>
              <h4 className="mb-4">{currentQuestion.questionText}</h4>
              
              <div className="d-grid gap-2">
                {currentQuestion.options.map((option, index) => (
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
            {questionIndex < totalQuestions ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default QuizPlayer;