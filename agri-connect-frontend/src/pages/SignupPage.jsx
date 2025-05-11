import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

// Define your API base URL using Vite's environment variable system
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('Farmer'); // Default selection
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
      }

      console.log('Signup successful:', data);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login?signup=success');
      }, 2000);

    } catch (err) {
      console.error('Signup failed:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                 <i className="bi bi-tree-fill" style={{ fontSize: '2.5rem', color: 'var(--agri-primary-green)' }}></i>
                <h3 className="mt-2" style={{ color: 'var(--agri-dark-green)'}}>Create AgriConnect Account</h3>
                 <p className="text-muted">Join our platform to manage your farm or find produce.</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="signupName">
                  <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="signupEmail">
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

                <Form.Group className="mb-3" controlId="signupPassword">
                  <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </Form.Group>

                 <Form.Group className="mb-3" controlId="signupConfirmPassword">
                  <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="signupUserType">
                  <Form.Label>I am a... <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    aria-label="Select user type"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Admin">Admin</option> {/* <-- MODIFIED HERE */}
                  </Form.Select>
                </Form.Group>

                <Button
                    variant="success"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                    style={{ backgroundColor: 'var(--agri-primary-green)', borderColor: 'var(--agri-primary-green)' }}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </Form>

              <div className="mt-4 text-center">
                <small className="text-muted">
                  Already have an account? <Link to="/login" style={{ color: 'var(--agri-dark-green)'}}>Log In</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPage;