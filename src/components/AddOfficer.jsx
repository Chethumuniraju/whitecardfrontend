import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddOfficer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    documentType: 'AADHAAR'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const documentTypes = [
    { type: 'AADHAAR', title: 'Aadhaar Card' },
    { type: 'DRIVING_LICENSE', title: 'Driving License' },
    { type: 'PAN', title: 'PAN Card' },
    { type: 'RATION_CARD', title: 'Ration Card' },
    { type: 'VOTER_ID', title: 'Voter ID' },
    { type: 'PASSPORT', title: 'Passport' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.post(
        'http://localhost:8080/api/admin/register-officer',
        formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Officer registered successfully!');
      setFormData({ name: '', email: '', password: '', phone: '', documentType: 'AADHAAR' });
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/admin-login');
      } else {
        alert(`Failed to register officer: ${error.message}`);
      }
    }
  };

  return (
    <Container fluid style={{ padding: '20px' }}>
      <h2 className="text-center mb-4" style={{ color: '#007bff', fontWeight: 'bold' }}>
        Register Document Officers
      </h2>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow" style={{ borderRadius: '10px', border: '1px solid #ddd' }}>
            <Card.Body style={{ padding: '30px' }}>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'bold' }}>Document Type</Form.Label>
                  <Form.Select name="documentType" value={formData.documentType} onChange={handleChange} required>
                    {documentTypes.map(({ type, title }) => (
                      <option key={type} value={type}>{title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'bold' }}>Officer Name</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter officer's name" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'bold' }}>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter officer's email" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 'bold' }}>Password</Form.Label>
                  <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password" />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 'bold' }}>Phone Number</Form.Label>
                  <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" pattern="[0-9]{10}" />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  Register Officer
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddOfficer;
