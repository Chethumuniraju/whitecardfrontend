import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="text-center">
        <Col xs={12} className="mb-4">
          <h1 className="display-4 mb-4">Welcome</h1>
          <p className="lead mb-5">Please select your role to continue</p>
        </Col>
        <Col xs={12} className="d-flex gap-3 justify-content-center flex-wrap">
          <Button 
            size="lg" 
            variant="primary"
            onClick={() => navigate('/user-login')}
          >
            User Login
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/admin-login')}
          >
            Admin Login
          </Button>
          <Button 
            size="lg" 
            variant="info"
            onClick={() => navigate('/officer-login')}
          >
            Officer Login
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage; 