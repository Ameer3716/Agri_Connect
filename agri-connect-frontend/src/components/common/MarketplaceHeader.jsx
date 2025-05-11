// src/components/common/MarketplaceHeader.jsx
import React from 'react';
import { Navbar, Nav, Container, Button, Badge, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';

const MarketplaceHeader = ({ userRole = 'buyer' }) => {
  const navigate = useNavigate();

  // Using the userRole prop with a default of 'buyer'
  const isAuthenticated = true; // Assume user is authenticated to see main nav
  const userName = localStorage.getItem('userName') || "Market User"; // Use consistent userName key
  const notificationCount = 1;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('buyerUserName'); // Or general 'userName'
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm sticky-top">
      <Container fluid>
        {/* AgriConnect Brand */}
        <LinkContainer to={isAuthenticated ? "/marketplace" : "/"}>
          {/* Single Child: Navbar.Brand */}
          <Navbar.Brand style={{ color: 'var(--agri-primary-green)', fontWeight: 'bold', cursor: 'pointer' }}>
            <i className="bi bi-tree-fill me-2"></i>
            AgriConnect
          </Navbar.Brand>
        </LinkContainer>        <Navbar.Toggle aria-controls="agriconnect-marketplace-main-navbar-nav" />
        <Navbar.Collapse id="agriconnect-marketplace-main-navbar-nav">
          {/* Links for users browsing the marketplace */}
          <Nav className="me-auto">
            <LinkContainer to="/marketplace">
              <Nav.Link>Browse Products</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/marketplace/trends">
              <Nav.Link>Market Trends</Nav.Link>
            </LinkContainer>
            
            {/* User-role specific links */}
            {userRole === 'buyer' && (
              <>
                <LinkContainer to="/marketplace/my-orders">
                  <Nav.Link>My Orders</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/cart">
                  <Nav.Link>Cart</Nav.Link>
                </LinkContainer>
              </>
            )}
            
            {userRole === 'farmer' && (
              <LinkContainer to="/marketplace/my-listings">
                <Nav.Link>My Listings</Nav.Link>
              </LinkContainer>
            )}
          </Nav>

          {/* Right Side Elements */}
          <Nav className="ms-auto">
            {isAuthenticated ? (
              // Authenticated User View
              <>
                <Button
                  variant="outline-secondary"
                  className="me-2 position-relative"
                  onClick={() => navigate('/notifications')}
                >
                  <i className="bi bi-bell-fill"></i>
                  {notificationCount > 0 && (
                    <Badge pill bg="danger" className="ms-1 position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6em', padding: '0.3em 0.5em' }}>
                      {notificationCount}
                      <span className="visually-hidden">unread messages</span>
                    </Badge>
                  )}
                </Button>
                <NavDropdown title={userName} id="marketplace-user-dropdown" align="end">
                  <LinkContainer to="/profile">
                    {/* Single Child: NavDropdown.Item */}
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/settings">
                    {/* Single Child: NavDropdown.Item */}
                    <NavDropdown.Item>Settings</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout <i className="bi bi-box-arrow-right ms-1"></i>
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              // Logged Out View
              <>
                <LinkContainer to="/login">
                  {/* Single Child: Nav.Link */}
                  <Nav.Link as={Button} variant="outline-success" size="sm" className="me-2">
                    Log In
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/signup">
                  {/* Single Child: Nav.Link */}
                  <Nav.Link as={Button} variant="success" size="sm" style={{ backgroundColor: 'var(--agri-primary-green)', borderColor: 'var(--agri-primary-green)' }}>
                    Sign Up
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MarketplaceHeader;