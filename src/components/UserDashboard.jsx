import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [allVerified, setAllVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/user-login');
      return;
    }
    fetchLatestDocuments();
  }, [navigate]);

  const fetchLatestDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8080/api/documents/latest',
        {
          headers: {
            'Authorization': token
          }
        }
      );

      setDocuments(response.data);
      
      // Check if all documents are verified
      const allDocsVerified = response.data.every(doc => doc.status === 'VERIFIED');
      setAllVerified(allDocsVerified);
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/user-login');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'VERIFIED': 'success',
      'REJECTED': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleUploadClick = () => {
    navigate('/document-upload');
  };

  const handleQRCodeClick = () => {
    navigate('/registered-documents');
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Documents</h2>
        <Button 
          variant="primary"
          onClick={handleUploadClick}
        >
          Upload New Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center">
          <p>No documents found. Start by uploading your documents.</p>
          <Button variant="primary" onClick={handleUploadClick}>
            Upload Documents
          </Button>
        </div>
      ) : (
        <>
          <Row className="g-4">
            {documents.map((doc) => (
              <Col key={doc.id} xs={12} md={6} lg={4}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{doc.documentType.replace('_', ' ')}</Card.Title>
                    <div className="mb-3">
                      <strong>Status: </strong>
                      {getStatusBadge(doc.status)}
                    </div>
                    {doc.documentImage && (
                      <div className="mb-3">
                        <img
                          src={`data:image/jpeg;base64,${doc.documentImage}`}
                          alt="Document"
                          className="img-fluid"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    {doc.status === 'REJECTED' && doc.rejectionReason && (
                      <div className="text-danger">
                        <strong>Rejection Reason: </strong>
                        {doc.rejectionReason}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {allVerified && (
            <div className="text-center mt-4">
           <Button variant="success" size="lg" onClick={handleQRCodeClick}>
                Get QR Code
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default UserDashboard;
