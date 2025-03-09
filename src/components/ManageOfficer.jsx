import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card } from 'react-bootstrap';
import axios from 'axios';

const ManageOfficer = () => {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/officers', {
          headers: { 'Authorization': token }
        });
        setOfficers(response.data);
      } catch (error) {
        alert('Failed to fetch officers.');
      }
    };
    fetchOfficers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/officers/${id}`, {
        headers: { 'Authorization': token }
      });
      setOfficers(officers.filter(officer => officer.officerId !== id));
      alert('Officer deleted successfully');
    } catch (error) {
      alert('Failed to delete officer');
    }
  };

  return (
    <Container 
      fluid 
      className="py-4"
      style={{ backgroundColor: "#E3F2FD", minHeight: "100vh", fontFamily: "Arial, sans-serif" }} // Light blue background & font style
    >
      <h2 className="text-center mb-4" style={{ fontWeight: "bold" }}>Manage Officers</h2>
      <Card className="shadow p-4">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {officers.map((officer) => (
              <tr key={officer.officerId}>
                <td>{officer.officerId}</td>
                <td>{officer.name}</td>
                <td>{officer.email}</td>
                <td>{officer.phone}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDelete(officer.officerId)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default ManageOfficer;
