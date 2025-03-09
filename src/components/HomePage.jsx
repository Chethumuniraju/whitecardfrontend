import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      style={{
        backgroundColor: "#E3F2FD", // Light blue
        color: "#333333",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <Row className="text-center">
        <Col xs={12} className="mb-4">
          <h1 className="display-4 mb-4" style={{ fontWeight: "bold" }}>Welcome</h1>
          <p className="lead mb-5" style={{ fontWeight: "bold" }}>Please select your role to continue</p>
        </Col>
        <Col xs={12} className="d-flex gap-3 justify-content-center flex-wrap">
          <Button 
            size="lg" 
            style={{ backgroundColor: "#4CAF50", color: "#ffffff", border: "none", fontWeight: "bold" }}
            onClick={() => navigate('/user-login')}
          >
            User Login
          </Button>
          <Button 
            size="lg" 
            style={{ backgroundColor: "#F39C12", color: "#ffffff", border: "none", fontWeight: "bold" }}
            onClick={() => navigate('/admin-login')}
          >
            Admin Login
          </Button>
          <Button 
            size="lg" 
            style={{ backgroundColor: "#3498DB", color: "#ffffff", border: "none", fontWeight: "bold" }}
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