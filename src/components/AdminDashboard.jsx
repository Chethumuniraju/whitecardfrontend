import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container 
      fluid 
      className="py-4" 
      style={{ backgroundColor: "#E3F2FD", minHeight: "100vh" }} // Light blue background
    >
      <h2 className="text-center mb-4">Admin Dashboard</h2>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow text-center p-4">
            <Card.Body>
              <Button variant="primary" className="mb-3 w-100" onClick={() => navigate('/add-officer')}>
                Add Officer
              </Button>
              <Button variant="secondary" className="w-100" onClick={() => navigate('/manage-officer')}>
                Manage Officers
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
