import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from '../utils/constants';

const QuizForm = ({ show, handleClose, quiz, onSubmit, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    difficulty: '',
    startDate: '',
    endDate: '',
    minPassingPercentage: 60
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (quiz) {
    setFormData({
      name: quiz.name || '',
      category: quiz.category || '',
      difficulty: quiz.difficulty || '',
      startDate: quiz.startDate ? new Date(quiz.startDate).toISOString().slice(0, 16) : '',
      endDate: quiz.endDate ? new Date(quiz.endDate).toISOString().slice(0, 16) : '',
      minPassingPercentage: quiz.minPassingPercentage || 60
    });
  } else {
    setFormData({
      name: '',
      category: '',
      difficulty: '',
      startDate: '',
      endDate: '',
      minPassingPercentage: 60
    });
  }
  setErrors({});
}, [quiz, show]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.minPassingPercentage < 0 || formData.minPassingPercentage > 100) 
      newErrors.minPassingPercentage = 'Min passing percentage must be between 0 and 100';
    
    // Check if end date is after start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
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
      // Convert dates to proper format for backend
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      
      await onSubmit(submitData);
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
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Min Passing Percentage *</Form.Label>
                <Form.Control
                  type="number"
                  name="minPassingPercentage"
                  value={formData.minPassingPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  isInvalid={!!errors.minPassingPercentage}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.minPassingPercentage}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  isInvalid={!!errors.startDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  isInvalid={!!errors.endDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.endDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
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