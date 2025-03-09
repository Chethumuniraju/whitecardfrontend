import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import QRCode from 'qrcode'; // Import QRCode from 'qrcode' package

const RegisteredDocuments = () => {
  const [documents, setDocuments] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    fetchRegisteredDocuments();
  }, []);

  const fetchRegisteredDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/documents/registered', {
        headers: { Authorization: token }
      });

      console.log('Registered Document Data:', response.data);
      setDocuments(response.data);

      // Generate QR code
      const qrString = formatQRData(response.data);
      generateQRCode(qrString);
    } catch (error) {
      console.error('Error fetching registered documents:', error);
    }
  };

  const formatQRData = (docs) => {
    if (!docs) return '';

    return JSON.stringify({
      Aadhaar: {
        Number: docs.aadhaarDetails?.aadhaarNumber || 'N/A',
        Name: docs.aadhaarDetails?.fullName || 'N/A',
        DOB: docs.aadhaarDetails?.dob || 'N/A',
      },
      PAN: {
        Number: docs.panCardDetails?.panNumber || 'N/A',
        Name: docs.panCardDetails?.fullName || 'N/A',
      },
      Passport: {
        Number: docs.passport?.passportNumber || 'N/A',
        Name: docs.passport?.fullName || 'N/A',
        DOB: docs.passport?.dob || 'N/A',
      },
      License: {
        Number: docs.drivingLicense?.licenseNumber || 'N/A',
        Name: docs.drivingLicense?.fullName || 'N/A',
      },
      RationCard: {
        Number: docs.rationCard?.rationCardNumber || 'N/A',
        Head: docs.rationCard?.familyHead || 'N/A',
      },
      VoterID: {
        Number: docs.voterID?.voterIdNumber || 'N/A',
        Name: docs.voterID?.fullName || 'N/A',
      },
    });
  };

  const generateQRCode = async (qrString) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(qrString);
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <Container className="py-4" style={{
      backgroundColor: "#E3F2FD", // Light blue
     
    }} >
      <h2 className="mb-4 text-center">Registered Documents</h2>

      {documents ? (
        <>
          <Row className="g-4">
            {Object.entries(documents).map(([key, doc]) => (
              <Col key={key} xs={12} md={6} lg={4}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title className="text-capitalize">{key.replace(/([A-Z])/g, ' $1')}</Card.Title>
                    
                    {doc.aadhaarNumber && <p><strong>Aadhaar Number:</strong> {doc.aadhaarNumber}</p>}
                    {doc.fullName && <p><strong>Full Name:</strong> {doc.fullName}</p>}
                    {doc.dob && <p><strong>Date of Birth:</strong> {doc.dob}</p>}
                    {doc.address && <p><strong>Address:</strong> {doc.address}</p>}

                    {doc.licenseNumber && <p><strong>License Number:</strong> {doc.licenseNumber}</p>}
                    {doc.expiryDate && <p><strong>Expiry Date:</strong> {doc.expiryDate}</p>}

                    {doc.panNumber && <p><strong>PAN Number:</strong> {doc.panNumber}</p>}

                    {doc.passportNumber && <p><strong>Passport Number:</strong> {doc.passportNumber}</p>}
                    {doc.nationality && <p><strong>Nationality:</strong> {doc.nationality}</p>}
                    
                    {doc.rationCardNumber && <p><strong>Ration Card Number:</strong> {doc.rationCardNumber}</p>}
                    {doc.familyHead && <p><strong>Family Head:</strong> {doc.familyHead}</p>}
                    {doc.numberOfFamilyMembers && <p><strong>Family Members:</strong> {doc.numberOfFamilyMembers}</p>}

                    {doc.voterIdNumber && <p><strong>Voter ID:</strong> {doc.voterIdNumber}</p>}
                    {doc.constituency && <p><strong>Constituency:</strong> {doc.constituency}</p>}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-4">
            <h3>QR Code for Document Details</h3>
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code" width="256" height="256" />
            ) : (
              <p>Generating QR Code...</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-center">Loading registered documents...</p>
      )}
    </Container>
  );
};

export default RegisteredDocuments;
