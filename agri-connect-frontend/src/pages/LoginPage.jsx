import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Ensure API_BASE_URL is correctly defined or imported if it's in a config file
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // For signup success message
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to handle messages from redirects (e.g., signup success, google login errors)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const signupStatus = params.get('signup');
    const loginError = params.get('error'); // For Google login errors passed back from backend

    if (signupStatus === 'success' && !showSuccess) { // Check !showSuccess to prevent multiple alerts if user navigates back
      setShowSuccess(true);
      // Clean the URL query params without reload
      navigate('/login', { replace: true, state: {} }); // Clear state too
    }

    if (loginError) {
      let errorMessage = 'Login failed. Please try again.';
      if (loginError === 'google_auth_failed') {
        errorMessage = 'Google authentication failed. Please try again or use standard login.';
      } else if (loginError === 'google_email_missing') {
        errorMessage = 'Could not retrieve email from Google. Please ensure your Google account has an email and permissions are granted.';
      } else if (loginError === 'jwt_signing_error' || loginError === 'user_not_found_after_auth') {
        errorMessage = 'Login failed due to a server error. Please try again later.';
      }
      // Add more specific error messages based on error codes you might define
      setError(errorMessage);
      // Clean the URL query params and potentially remove error from state if displayed
      navigate('/login', { replace: true, state: {} }); // Clear query and state error
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // Only re-run if search params change

   // Display error from navigation state if available (e.g. if backend redirects with state)
   useEffect(() => {
       if (location.state?.error && !error) { // Check !error to avoid overriding more specific errors
           setError(location.state.error);
       }
   }, [location.state, error]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { // Standard login endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      console.log('Standard login successful:', data);
      setLoading(false);

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        userType: data.userType,
      }));

      // Role-based redirection
      switch (data.userType) {
        case 'Farmer':
          navigate('/dashboard');
          break;
        case 'Buyer':
          navigate('/marketplace');
          break;
        case 'Admin':
          navigate('/admin/marketplace-management');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
       console.error('Standard login failed:', err);
       setError(err.message || 'Login failed. Please check your credentials.');
       setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError(''); // Clear previous errors
    // The loading state for Google login is implicitly handled by the browser navigation
    console.log('Redirecting to Google Login via backend...');
    // This URL should match the route in your backend (authRoutes.js) that initiates Google OAuth
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                 <i className="bi bi-box-arrow-in-right" style={{ fontSize: '2.5rem', color: 'var(--agri-primary-green)' }}></i>
                <h3 className="mt-2" style={{ color: 'var(--agri-dark-green)'}}>Log In to AgriConnect</h3>
                <p className="text-muted">Access your dashboard and the marketplace.</p>
              </div>

              {showSuccess && <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>Signup successful! Please log in.</Alert>}
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}


              <Form onSubmit={handleSubmit}>
                 <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email address <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="loginPassword">
                    <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                 <div className="d-flex justify-content-end mb-4">
                    <Link to="/forgot-password" style={{ fontSize: '0.9em', color: 'var(--agri-dark-green)' }}>Forgot Password?</Link>
                 </div>

                <Button
                    variant="success"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                    style={{ backgroundColor: 'var(--agri-primary-green)', borderColor: 'var(--agri-primary-green)' }}
                >
                  {loading ? 'Logging In...' : 'Log In'}
                </Button>

                 <Button
                    variant="outline-secondary"
                    type="button"
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={handleGoogleLogin}
                    // Don't disable this with standard login 'loading' state, as it's a separate flow
                >
                   <i className="bi bi-google me-2"></i> Login with Google
                </Button>
              </Form>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  Don't have an account? <Link to="/signup" style={{ color: 'var(--agri-dark-green)'}}>Sign Up</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;