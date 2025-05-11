// src/components/Auth/GoogleCallbackHandler.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';

const GoogleCallbackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('_id');
    const name = params.get('name');
    const email = params.get('email');
    const userType = params.get('userType');
    const errorCode = params.get('error'); // Check if backend sent an error code

    if (errorCode) {
        // Handle errors passed from backend callback
        let errorMessage = "Google login failed. Please try again.";
        if (errorCode === 'google_auth_failed') {
            errorMessage = "Google authentication failed at the server. Please try again.";
        } else if (errorCode === 'user_not_found_after_auth') {
             errorMessage = "Could not retrieve user details after Google authentication.";
        }
        // Add more specific error messages based on codes you might define
        setError(errorMessage);
        // Optionally redirect to login with error after a delay
        // setTimeout(() => navigate('/login?error=' + errorCode), 3000);
        return;
    }


    if (token && userId && name && email && userType) {
      // Store token and user info (same as in standard login)
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({
        _id: userId,
        name: name,
        email: email,
        userType: userType,
      }));

      console.log('Google login successful, user data stored.');

      // Role-based redirection (same as in standard login)
      switch (userType) {
        case 'Farmer':
          navigate('/dashboard', { replace: true });
          break;
        case 'Buyer':
          navigate('/marketplace', { replace: true });
          break;
        case 'Admin':
          navigate('/admin/marketplace-management', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
          break;
      }
    } else {
      // If essential data is missing, treat as an error
      console.error('Google callback: Missing essential user data or token in query params.');
      setError('Failed to process Google login. Essential data missing.');
      // Redirect to login page with an error
      // navigate('/login?error=google_callback_data_missing', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]); // location.search is the dependency

  if (error) {
    return (
        <Container className="text-center mt-5">
            <Alert variant="danger">{error}</Alert>
            <Button variant="primary" onClick={() => navigate('/login')}>Go to Login</Button>
        </Container>
    );
  }

  return (
    <Container className="text-center mt-5" style={{minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Spinner animation="border" variant="success" style={{width: '3rem', height: '3rem'}} />
      <p className="mt-3 fs-5">Processing your Google login...</p>
      <p className="text-muted">Please wait, you will be redirected shortly.</p>
    </Container>
  );
};

export default GoogleCallbackHandler;