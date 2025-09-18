import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5">
      <div className="text-center">
        <Card>
          <Card.Body className="p-5">
            <h1 className="display-1 text-danger">403</h1>
            <h2>Access Denied</h2>
            <p className="lead">
              You don't have permission to access this page.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Unauthorized;