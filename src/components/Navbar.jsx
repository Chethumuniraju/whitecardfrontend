import React from "react";
import { Navbar, Container } from "react-bootstrap";

const MyNavbar = () => {
  return (
    <Navbar
      style={{
        backgroundColor: "#1e3a8a",
        padding: "10px 20px",
        borderRadius: "5px"
      }}
      expand="lg"
    >
      <Container className="justify-content-center">
        <Navbar.Brand
          className="fw-bold fs-4"
          style={{ color: "#ffffff" }}
        >
          WhiteCard
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
