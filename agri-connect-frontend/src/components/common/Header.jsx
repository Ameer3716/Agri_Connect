// src/components/common/Header.jsx
import React from 'react';
import { Navbar, Nav, Container, Button, Badge, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';

// THIS 'userRole' PROP WILL BE PASSED FROM MainLayout
const Header = ({ userRole = 'farmer' }) => {  // Default to 'farmer' if not provided (or if localStorage is empty for role)
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || (userRole === 'admin' ? "Admin" : (userRole === 'farmer' ? "Farmer" : "User"));
  const notificationCount = 3; // Example

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Determine the correct dashboard link for the brand based on role
  let brandDashboardLink = "/"; // Default for guest or unspecific role after login
  if (userRole === 'admin') {
    brandDashboardLink = "/admin/marketplace-management"; // Or another primary admin page
  } else if (userRole === 'farmer') {
    brandDashboardLink = "/dashboard";
  }


  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm sticky-top">
      <Container fluid>
        <LinkContainer to={brandDashboardLink}>
          <Navbar.Brand style={{ color: 'var(--agri-primary-green)', fontWeight: 'bold', cursor: 'pointer' }}>
            <i className="bi bi-tree-fill me-2"></i>
            AgriConnect
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="agriconnect-dynamic-navbar-nav" />
        <Navbar.Collapse id="agriconnect-dynamic-navbar-nav">
          <Nav className="me-auto">
            {(userRole === 'farmer' || !userRole) && userRole !== 'admin' && userRole !== 'buyer' && (
              <>
                <LinkContainer to="/dashboard"><Nav.Link>Dashboard</Nav.Link></LinkContainer>
                <LinkContainer to="/planning"><Nav.Link>Crop Planning</Nav.Link></LinkContainer>
                <LinkContainer to="/financials"><Nav.Link>Financials</Nav.Link></LinkContainer>
                <LinkContainer to="/marketplace/my-listings"><Nav.Link>My Product Listings</Nav.Link></LinkContainer>
                <LinkContainer to="/marketplace"><Nav.Link>Marketplace</Nav.Link></LinkContainer>
              </>
            )}
            {userRole === 'admin' && (
              <>
                {/* UPDATED ADMIN LINKS */}
                <LinkContainer to="/admin/marketplace-management"><Nav.Link>Marketplace Mgt.</Nav.Link></LinkContainer>
                <LinkContainer to="/admin/farm-activity"><Nav.Link>Farm Activity</Nav.Link></LinkContainer>
                <LinkContainer to="/admin/users"><Nav.Link>User Management</Nav.Link></LinkContainer>
                {/* Add other core admin links if necessary, e.g., System Settings, Reports */}
              </>
            )}
            {userRole === 'buyer' && (
              <>
                <LinkContainer to="/marketplace"><Nav.Link>Marketplace</Nav.Link></LinkContainer>
                <LinkContainer to="/marketplace/my-orders"><Nav.Link>My Orders</Nav.Link></LinkContainer>
                <LinkContainer to="/cart"><Nav.Link>Cart</Nav.Link></LinkContainer>
              </>
            )}
          </Nav>

          <Nav className="ms-auto">
            <Button
              variant="outline-secondary"
              className="me-2 position-relative"
              // Admin notification bell might link to a specific section within marketplace management or a separate simple notification list if needed.
              // For now, let's keep it simple or point to a general notifications page.
              onClick={() => navigate(userRole === 'admin' ? '/admin/marketplace-management' : (userRole === 'farmer' ? '/farmer-notifications' : '/notifications'))}
            >
              <i className="bi bi-bell-fill"></i>
              {notificationCount > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className="ms-1 position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.6em', padding: '0.3em 0.5em' }}
                >
                  {notificationCount}
                  <span className="visually-hidden">unread messages</span>
                </Badge>
              )}
            </Button>

            <NavDropdown title={userName} id="user-role-dropdown" align="end">
              <LinkContainer to="/profile">
                <NavDropdown.Item>Profile</NavDropdown.Item>
              </LinkContainer>
              {userRole !== 'admin' && ( // Settings link for non-admin users
                <LinkContainer to="/settings">
                    <NavDropdown.Item>Settings</NavDropdown.Item>
                </LinkContainer>
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Logout <i className="bi bi-box-arrow-right ms-1"></i>
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;