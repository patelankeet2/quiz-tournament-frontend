import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { quizService } from '../services/quizService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllUsers();
      
      // Handle the response from backend
      setUsers(Array.isArray(data) ? data : []);
      setError('');
    } catch (error) {
      setError('Failed to fetch users: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await quizService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      setDeleteConfirm(null);
    } catch (error) {
      setError('Failed to delete user: ' + (error.response?.data?.message || error.message));
      console.error('Error deleting user:', error);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: 'danger',
      PLAYER: 'success'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <Button variant="outline-danger" size="sm" onClick={fetchUsers}>
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <>
      {users.length === 0 ? (
        <Alert variant="info">
          No users found.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username || 'N/A'}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email || 'N/A'}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setDeleteConfirm(user)}
                    disabled={user.role === 'ADMIN'}
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
          Are you sure you want to delete the user "{deleteConfirm?.username}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDeleteUser(deleteConfirm.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagement;