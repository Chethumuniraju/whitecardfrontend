import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState({});

  const documentTypes = [
    { type: 'AADHAAR', title: 'Aadhaar Card' },
    { type: 'DRIVING_LICENSE', title: 'Driving License' },
    { type: 'PAN', title: 'PAN Card' },
    { type: 'RATION_CARD', title: 'Ration Card' },
    { type: 'VOTER_ID', title: 'Voter ID' },
    { type: 'PASSPORT', title: 'Passport' }
  ];

  const handleFileSelect = (documentType, file) => {
    setSelectedFiles({
      ...selectedFiles,
      [documentType]: file
    });
  };

  const handleUpload = async (documentType) => {
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('documentImage', selectedFiles[documentType]);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        'http://localhost:8080/api/documents/upload',
        formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Document uploaded successfully!');
      setSelectedFiles({
        ...selectedFiles,
        [documentType]: null
      });
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Upload Documents</h2>
        <Button variant="secondary" onClick={() => navigate('/user-dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Row className="g-4">
        {documentTypes.map(({ type, title }) => (
          <Col key={type} xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center mb-3">{title}</Card.Title>
                
                <Form.Group className="mb-3">
                  <Form.Label>Upload {title}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(type, e.target.files[0])}
                  />
                </Form.Group>

                <div className="mt-auto">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => handleUpload(type)}
                    disabled={!selectedFiles[type]}
                  >
                    {selectedFiles[type] ? 'Upload Document' : 'Select File First'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DocumentUpload; 