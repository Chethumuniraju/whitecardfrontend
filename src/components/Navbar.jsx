import React from "react";
import { Navbar, Container } from "react-bootstrap";

const MyNavbar = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container className="justify-content-center">
        <Navbar.Brand className="fw-bold fs-4">WhiteCard</Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
