import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationData, setVerificationData] = useState({
    documentId: '',
    aadhaarNumber: '',
    fullName: '',
    dob: '',
    address: '',
    token: ''
  });
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionData, setRejectionData] = useState({
    documentId: null,
    rejectionReason: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'officer') {
      navigate('/officer-login');
      return;
    }
    
    fetchDocuments();
  }, [navigate]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/officer-login');
        return;
      }

      console.log('Using token:', token);

      const response = await axios.get(
        'http://localhost:8080/api/officer/documents',
        {
          headers: {
            'Authorization': token
          }
        }
      );

      console.log('Documents Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setDocuments(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      console.error('Error Response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        navigate('/officer-login');
      } else if (error.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert('Failed to fetch documents: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleVerifyClick = (document) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found. Please login again.');
      navigate('/officer-login');
      return;
    }

    setSelectedDocument(document);
    setVerificationData({
      documentId: document.id,
      fullName: document.user?.name || '',
      dob: '',
      address: '',
      token: token.replace('Bearer ', ''),
      // Reset all document-specific fields
      aadhaarNumber: '',
      panNumber: '',
      licenseNumber: '',
      passportNumber: '',
      nationality: '',
      rationCardNumber: '',
      familyHead: '',
      numberOfFamilyMembers: '',
      voterIdNumber: '',
      constituency: '',
      expiryDate: ''
    });
    setShowVerifyModal(true);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Remove all non-digits and hyphens from Aadhaar number
      const cleanAadhaarNumber = verificationData.aadhaarNumber.replace(/[-\D]/g, '');

      // Validate Aadhaar number length
      if (cleanAadhaarNumber.length !== 12) {
        alert('Aadhaar number must be exactly 12 digits');
        return;
      }

      const dataToSend = {
        ...verificationData,
        aadhaarNumber: cleanAadhaarNumber,
        token: verificationData.token
      };

      console.log('Sending verification data:', dataToSend);

      // First, save the Aadhaar details
      await axios.post(
        'http://localhost:8080/api/aadhaar/save',
        dataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Then, update the document status
      await axios.post(
        'http://localhost:8080/api/documents/accept',
        {
          documentId: verificationData.documentId
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Document verified and accepted successfully!');
      setShowVerifyModal(false);
      fetchDocuments(); // Refresh the list
    } catch (error) {
      console.error('Verification Error:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        navigate('/officer-login');
      } else {
        alert('Verification failed: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleRejectClick = (documentId) => {
    setRejectionData({
      documentId,
      rejectionReason: ''
    });
    setShowRejectionModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!rejectionData.rejectionReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }

      await axios.post(
        'http://localhost:8080/api/documents/reject',
        rejectionData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Document rejected successfully!');
      setShowRejectionModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Rejection Error:', error);
      alert('Rejection failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePanVerification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields
      if (!verificationData.panNumber || !verificationData.fullName || 
          !verificationData.dob || !verificationData.address) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate PAN number format
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(verificationData.panNumber)) {
        alert('Invalid PAN number format. Please use format: ABCDE1234F');
        return;
      }

      // Format date
      let formattedDob;
      try {
        formattedDob = new Date(verificationData.dob).toISOString().split('T')[0];
        if (!formattedDob || formattedDob === 'Invalid Date') {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        alert('Please enter a valid date of birth');
        return;
      }

      const dataToSend = {
        documentId: verificationData.documentId,
        panNumber: verificationData.panNumber,
        fullName: verificationData.fullName,
        dob: formattedDob,
        address: verificationData.address.trim()
      };

      // First save the PAN details
      await axios.post(
        'http://localhost:8080/api/pan/save',
        dataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Then update document status
      await updateDocumentStatus(verificationData.documentId, token);

      alert('PAN Card verified and accepted successfully!');
      setShowVerifyModal(false);
      fetchDocuments();
    } catch (error) {
      handleVerificationError(error);
    }
  };

  const handleDrivingLicenseVerification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields
      if (!verificationData.licenseNumber || !verificationData.fullName || 
          !verificationData.dob || !verificationData.address || !verificationData.expiryDate) {
        alert('Please fill in all required fields');
        return;
      }

      // Format dates
      let formattedDob, formattedExpiryDate;
      try {
        formattedDob = new Date(verificationData.dob).toISOString().split('T')[0];
        formattedExpiryDate = new Date(verificationData.expiryDate).toISOString().split('T')[0];
        if (!formattedDob || formattedDob === 'Invalid Date' || 
            !formattedExpiryDate || formattedExpiryDate === 'Invalid Date') {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        alert('Please enter valid dates');
        return;
      }

      const dataToSend = {
        documentId: verificationData.documentId,
        licenseNumber: verificationData.licenseNumber.toUpperCase(),
        fullName: verificationData.fullName,
        dob: formattedDob,
        address: verificationData.address.trim(),
        expiryDate: formattedExpiryDate
      };

      await axios.post(
        'http://localhost:8080/api/drivinglicense/save',
        dataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      await updateDocumentStatus(verificationData.documentId, token);
      alert('Driving License verified and accepted successfully!');
      setShowVerifyModal(false);
      fetchDocuments();
    } catch (error) {
      handleVerificationError(error);
    }
  };

  const handlePassportVerification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields
      if (!verificationData.passportNumber || !verificationData.fullName || 
          !verificationData.dob || !verificationData.address || 
          !verificationData.nationality || !verificationData.expiryDate) {
        alert('Please fill in all required fields');
        return;
      }

      // Format dates
      let formattedDob, formattedExpiryDate;
      try {
        formattedDob = new Date(verificationData.dob).toISOString().split('T')[0];
        formattedExpiryDate = new Date(verificationData.expiryDate).toISOString().split('T')[0];
        if (!formattedDob || formattedDob === 'Invalid Date' || 
            !formattedExpiryDate || formattedExpiryDate === 'Invalid Date') {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        alert('Please enter valid dates');
        return;
      }

      const dataToSend = {
        documentId: verificationData.documentId,
        passportNumber: verificationData.passportNumber.toUpperCase(),
        fullName: verificationData.fullName,
        dob: formattedDob,
        address: verificationData.address.trim(),
        nationality: verificationData.nationality.trim(),
        expiryDate: formattedExpiryDate
      };

      await axios.post(
        'http://localhost:8080/api/passport/save',
        dataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      await updateDocumentStatus(verificationData.documentId, token);
      alert('Passport verified and accepted successfully!');
      setShowVerifyModal(false);
      fetchDocuments();
    } catch (error) {
      handleVerificationError(error);
    }
  };

  const handleRationCardVerification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const dataToSend = {
        documentId: verificationData.documentId,
        rationCardNumber: verificationData.rationCardNumber,
        familyHead: verificationData.familyHead,
        numberOfFamilyMembers: verificationData.numberOfFamilyMembers,
        address: verificationData.address
      };

      await axios.post(
        'http://localhost:8080/api/rationcard/save',
        dataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      await updateDocumentStatus(verificationData.documentId, token);
      alert('Ration Card verified and accepted successfully!');
      setShowVerifyModal(false);
      fetchDocuments();
    } catch (error) {
      handleVerificationError(error);
    }
  };

  const handleVoterIdVerification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields first
      if (!verificationData.voterIdNumber || !verificationData.fullName || 
          !verificationData.dob || !verificationData.address || 
          !verificationData.constituency) {
        alert('Please fill in all required fields');
        return;
      }

      // Format the date to match backend's expected format (YYYY-MM-DD)
      let formattedDob;
      try {
        const dobDate = new Date(verificationData.dob);
        if (isNaN(dobDate.getTime())) {
          throw new Error('Invalid date');
        }
        formattedDob = dobDate.toISOString().split('T')[0];
      } catch (error) {
        alert('Please enter a valid date of birth');
        return;
      }

      const dataToSend = {
        documentId: verificationData.documentId,
        voterIdNumber: verificationData.voterIdNumber.toUpperCase().trim(),
        fullName: verificationData.fullName.trim(),
        dob: formattedDob,
        address: verificationData.address.trim(),
        constituency: verificationData.constituency.trim()
      };

      // Log the data being sent
      console.log('Sending voter ID verification data:', dataToSend);

      // First save the voter ID details
      await axios.post(
        'http://localhost:8080/api/voterid/save',
        dataToSend,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Then update the document status
      await updateDocumentStatus(verificationData.documentId, token);
      
      alert('Voter ID verified and accepted successfully!');
      setShowVerifyModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Verification Error:', error);
      console.error('Error Response:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        navigate('/officer-login');
      } else {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Verification failed: ${errorMessage}`);
      }
    }
  };

  // Helper function to update document status
  const updateDocumentStatus = async (documentId, token) => {
    await axios.post(
      'http://localhost:8080/api/documents/accept',
      { documentId },
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
  };

  // Helper function to handle verification errors
  const handleVerificationError = (error) => {
    console.error('Verification Error:', error);
    if (error.response?.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      navigate('/officer-login');
    } else {
      alert('Verification failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const renderVerificationForm = () => {
    if (!selectedDocument) return null;

    const commonProps = {
      documentId: selectedDocument.id,
      fullName: selectedDocument.user?.name || '',
      token: verificationData.token
    };

    switch (selectedDocument.documentType) {
      case 'AADHAAR':
        return (
          <Form onSubmit={handleVerificationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Aadhaar Number</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.aadhaarNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.match(/.{1,4}/g)?.join('-') || value;
                  setVerificationData({
                    ...verificationData,
                    aadhaarNumber: formatted
                  });
                }}
                required
                maxLength={14}
                placeholder="1234-5678-9012"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.fullName}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  fullName: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={verificationData.dob}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  dob: e.target.value
                })}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationData.address}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  address: e.target.value
                })}
                required
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Verify Document
              </Button>
            </div>
          </Form>
        );

      case 'PAN':
        return (
          <Form onSubmit={handlePanVerification}>
            <Form.Group className="mb-3">
              <Form.Label>PAN Number</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.panNumber}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  panNumber: e.target.value.toUpperCase()
                })}
                required
                maxLength={10}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                placeholder="ABCDE1234F"
              />
              <Form.Text className="text-muted">
                Format: 5 letters, 4 numbers, 1 letter
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.fullName}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  fullName: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={verificationData.dob}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  dob: e.target.value
                })}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationData.address}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  address: e.target.value
                })}
                required
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Verify Document
              </Button>
            </div>
          </Form>
        );

      case 'DRIVING_LICENSE':
        return (
          <Form onSubmit={handleDrivingLicenseVerification}>
            <Form.Group className="mb-3">
              <Form.Label>License Number</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.licenseNumber}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  licenseNumber: e.target.value.toUpperCase()
                })}
                required
                placeholder="DL1234567890"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.fullName}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  fullName: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={verificationData.dob}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  dob: e.target.value
                })}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationData.address}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  address: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="date"
                value={verificationData.expiryDate}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  expiryDate: e.target.value
                })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Verify Document
              </Button>
            </div>
          </Form>
        );

      case 'PASSPORT':
        return (
          <Form onSubmit={handlePassportVerification}>
            <Form.Group className="mb-3">
              <Form.Label>Passport Number</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.passportNumber}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  passportNumber: e.target.value.toUpperCase()
                })}
                required
                placeholder="A1234567"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.fullName}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  fullName: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={verificationData.dob}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  dob: e.target.value
                })}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationData.address}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  address: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nationality</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.nationality}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  nationality: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="date"
                value={verificationData.expiryDate}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  expiryDate: e.target.value
                })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Verify Document
              </Button>
            </div>
          </Form>
        );

      case 'RATION_CARD':
        return (
          <Form onSubmit={handleRationCardVerification}>
            <Form.Group className="mb-3">
              <Form.Label>Ration Card Number</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.rationCardNumber}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  rationCardNumber: e.target.value.toUpperCase()
                })}
                required
                placeholder="RC123456789"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Family Head Name</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.familyHead}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  familyHead: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Number of Family Members</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={verificationData.numberOfFamilyMembers}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  numberOfFamilyMembers: parseInt(e.target.value)
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationData.address}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  address: e.target.value
                })}
                required
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Verify Document
              </Button>
            </div>
          </Form>
        );

      case 'VOTER_ID':
        return (
          <Form onSubmit={handleVoterIdVerification}>
            <Form.Group className="mb-3">
              <Form.Label>Voter ID Number</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.voterIdNumber}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  voterIdNumber: e.target.value.toUpperCase()
                })}
                required
                placeholder="XYZ1234567"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.fullName}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  fullName: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={verificationData.dob}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  dob: e.target.value
                })}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={verificationData.address}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  address: e.target.value
                })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Constituency</Form.Label>
              <Form.Control
                type="text"
                value={verificationData.constituency}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  constituency: e.target.value
                })}
                required
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Verify Document
              </Button>
            </div>
          </Form>
        );

      default:
        return <p>Unsupported document type</p>;
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="text-center mb-4">Document Verification Dashboard</h2>
      {documents.length === 0 ? (
        <div className="text-center">
          <p>No documents available for verification.</p>
        </div>
      ) : (
        <Row className="g-4">
          {documents.map((doc) => (
            <Col key={doc.id} xs={12} lg={6}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Document ID: {doc.id}</Card.Title>
                  <div className="mb-3">
                    <strong>User:</strong> {doc.user?.name} ({doc.user?.email})
                  </div>
                  <div className="mb-3">
                    <strong>Document Type:</strong> {doc.documentType}
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong>{' '}
                    <Badge bg={
                      doc.status === 'PENDING' ? 'warning' :
                      doc.status === 'VERIFIED' ? 'success' : 'danger'
                    }>
                      {doc.status}
                    </Badge>
                  </div>
                  {doc.documentImage && (
                    <div className="mb-3">
                      <strong>Document Image:</strong>
                      <img 
                        src={`data:image/jpeg;base64,${doc.documentImage}`}
                        alt="Document"
                        className="img-fluid mt-2"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  )}
                  {doc.status === 'PENDING' && (
                    <div className="d-flex gap-2">
                      <Button 
                        variant="success"
                        onClick={() => handleVerifyClick(doc)}
                      >
                        Verify
                      </Button>
                      <Button 
                        variant="danger"
                        onClick={() => handleRejectClick(doc.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {doc.status === 'REJECTED' && doc.rejectionReason && (
                    <div className="mt-2">
                      <strong>Rejection Reason:</strong>
                      <p className="text-danger mb-0">{doc.rejectionReason}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Verification Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Verify {selectedDocument?.documentType.replace('_', ' ')} Document
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderVerificationForm()}
        </Modal.Body>
      </Modal>

      {/* Rejection Modal */}
      <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReject}>
            <Form.Group className="mb-3">
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectionData.rejectionReason}
                onChange={(e) => setRejectionData({
                  ...rejectionData,
                  rejectionReason: e.target.value
                })}
                required
                placeholder="Please provide a reason for rejection..."
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Reject Document
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OfficerDashboard; 