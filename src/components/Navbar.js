import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CustomNavbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home">Quiz Tournament</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user ? (
              <>
                <Nav.Link onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/player')}>
                  Dashboard
                </Nav.Link>
                {user.role === 'ADMIN' && (
                  <Nav.Link onClick={() => navigate('/admin')}>
                    Manage Quizzes
                  </Nav.Link>
                )}
                <Nav.Link onClick={() => navigate('/profile')}>
                  Profile
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link onClick={() => navigate('/login')}>Login</Nav.Link>
                <Nav.Link onClick={() => navigate('/register')}>Register</Nav.Link>
              </>
            )}
          </Nav>
          {user && (
            <Nav>
              <Navbar.Text className="me-3">
                Signed in as: {user.username} ({user.role})
              </Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;