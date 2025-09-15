import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from '../utils/constants';

const QuizForm = ({ show, handleClose, quiz, onSubmit, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    difficulty: '',
    description: '',
    timeLimit: 10,
    maxAttempts: 1,
    isPublic: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz) {
      setFormData({
        name: quiz.name || '',
        category: quiz.category || '',
        difficulty: quiz.difficulty || '',
        description: quiz.description || '',
        timeLimit: quiz.timeLimit || 10,
        maxAttempts: quiz.maxAttempts || 1,
        isPublic: quiz.isPublic !== undefined ? quiz.isPublic : true
      });
    } else {
      setFormData({
        name: '',
        category: '',
        difficulty: '',
        description: '',
        timeLimit: 10,
        maxAttempts: 1,
        isPublic: true
      });
    }
    setErrors({});
  }, [quiz, show]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required';
    if (formData.timeLimit < 1) newErrors.timeLimit = 'Time limit must be at least 1 minute';
    if (formData.maxAttempts < 1) newErrors.maxAttempts = 'Max attempts must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Failed to save quiz' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'edit' ? 'Edit Quiz' : 'Create New Quiz'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quiz Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  isInvalid={!!errors.category}
                >
                  <option value="">Select Category</option>
                  {QUIZ_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Difficulty *</Form.Label>
                <Form.Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  isInvalid={!!errors.difficulty}
                >
                  <option value="">Select Difficulty</option>
                  {QUIZ_DIFFICULTIES.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.difficulty}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Time Limit (minutes) *</Form.Label>
                <Form.Control
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  min="1"
                  isInvalid={!!errors.timeLimit}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.timeLimit}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Max Attempts *</Form.Label>
                <Form.Control
                  type="number"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  min="1"
                  isInvalid={!!errors.maxAttempts}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maxAttempts}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Form.Check
            type="switch"
            id="isPublic"
            name="isPublic"
            label="Make this quiz public"
            checked={formData.isPublic}
            onChange={handleChange}
            className="mb-3"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'edit' ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default QuizForm;