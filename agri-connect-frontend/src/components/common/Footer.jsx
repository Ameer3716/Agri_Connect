
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light text-center text-lg-start mt-auto py-3">
      <Container>
        <Row>
          <Col lg={6} md={12} className="mb-4 mb-md-0">
            <h5 className="text-uppercase" style={{ color: 'var(--agri-primary-green)' }}>AgriConnect</h5>
            <p>
              Empowering Pakistani farmers with technology for better farm management and market access.
            </p>
          </Col>
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase">Links</h5>
            <ul className="list-unstyled mb-0">
              <li><a href="#!" className="text-dark text-decoration-none">About Us</a></li>
              <li><a href="#!" className="text-dark text-decoration-none">Contact</a></li>
              <li><a href="#!" className="text-dark text-decoration-none">Privacy Policy</a></li>
              <li><a href="#!" className="text-dark text-decoration-none">Terms & Conditions</a></li>
            </ul>
          </Col>
           <Col lg={3} md={6} className="mb-4 mb-md-0">
             <h5 className="text-uppercase">Follow Us</h5>
             <div>
               <a href="#!" className="text-dark me-3 fs-4"><i className="bi bi-facebook"></i></a>
               <a href="#!" className="text-dark me-3 fs-4"><i className="bi bi-twitter"></i></a>
               <a href="#!" className="text-dark me-3 fs-4"><i className="bi bi-instagram"></i></a>
             </div>
           </Col>
        </Row>
        <hr className="my-3" />
        <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
          © {currentYear} AgriConnect | All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;