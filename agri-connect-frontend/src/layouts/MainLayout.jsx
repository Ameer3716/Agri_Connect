// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header'; // Your standard header
import MarketplaceHeader from '../components/common/MarketplaceHeader'; // Your marketplace-specific header
import Footer from '../components/common/Footer';
import { Container } from 'react-bootstrap';

const MainLayout = () => {
  const location = useLocation();
  // Get role for the standard Header, or set a default for development
  let userRole = localStorage.getItem('userRole');
  
  // For development: Set a default role if none exists
  if (!userRole) {
    // Determine a default role based on the current path
    if (location.pathname.startsWith('/admin')) {
      userRole = 'admin';
    } else if (location.pathname.startsWith('/marketplace') || location.pathname.startsWith('/cart')) {
      userRole = 'buyer';
    } else {
      userRole = 'farmer';
    }
    // Uncomment to persist this role to localStorage (optional)
    // localStorage.setItem('userRole', userRole);
  }

  // Determine which header to use
  const isMarketplacePath = location.pathname.startsWith('/marketplace');
  const isCartPath = location.pathname.startsWith('/cart');
  const useMarketplaceSpecificHeader = isMarketplacePath || isCartPath;

  const CurrentHeaderComponent = useMarketplaceSpecificHeader ? MarketplaceHeader : Header;

  console.log(
    "MainLayout rendering. Path:",
    location.pathname,
    "Using Header:",
    CurrentHeaderComponent.name,
    "UserRole from localStorage for Header:", userRole
  );

  return (
    <div className="d-flex flex-column min-vh-100">      {/* Pass userRole to both header components */}
      {useMarketplaceSpecificHeader ? (
        <MarketplaceHeader userRole={userRole} />
      ) : (
        <Header userRole={userRole} />
      )}
      <Container fluid className="flex-grow-1 py-4">
        <Outlet /> {/* Child routes will render here */}
      </Container>
      <Footer />
    </div>
  );
};

export default MainLayout;