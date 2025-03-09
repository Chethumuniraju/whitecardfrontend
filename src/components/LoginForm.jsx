import React, { useState } from 'react';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = ({ userType }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = userType === 'admin' 
        ? 'http://localhost:8080/api/admin/login'
        : 'http://localhost:8080/api/users/login';

      const response = await axios.post(endpoint, formData);
      
      // Store the complete token with 'Bearer' prefix
      localStorage.setItem('token', `Bearer ${response.data}`);
      
      navigate(`/${userType}-dashboard`);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <Container 
      fluid 
      className="d-flex align-items-center justify-content-center" 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f4f4f4'  // Set this to match the color of your other pages
      }}
    >
      <Row className="justify-content-center w-100">
        <Col md={6}>
          <Card 
            style={{ 
              borderRadius: '15px', 
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
              backgroundColor: '#F39C12' // Keeping the card white for contrast
            }}
          >
            <Card.Body className="p-5">
              <h2 className="text-center mb-4" style={{ color: '#333', fontWeight: 'bold' }}>
                {userType === 'admin' ? 'Admin Login' : 'User Login'}
              </h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'bold' }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    style={{ borderRadius: '10px', padding: '10px' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 'bold' }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    style={{ borderRadius: '10px', padding: '10px' }}
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3" 
                  style={{ borderRadius: '10px', fontWeight: 'bold', padding: '10px' }}
                >
                  Login
                </Button>

                <div className="text-center">
                  <p className="mb-0" style={{ fontSize: '14px', color: '#666' }}>
                    Don't have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0"
                      style={{ textDecoration: 'none', fontWeight: 'bold', color: '#007bff' }}
                      onClick={() => navigate(`/${userType}-signup`)}
                    >
                      Sign up
                    </Button>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;
