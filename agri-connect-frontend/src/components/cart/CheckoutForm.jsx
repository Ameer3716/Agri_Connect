// src/components/cart/CheckoutForm.jsx
import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

const CheckoutForm = ({ onConfirmOrder }) => {
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !address.trim() || !city.trim() || !contactNumber.trim()) {
            setError('Please fill in all required fields: Name, Address, City, and Contact Number.');
            return;
        }
        setError('');
        onConfirmOrder({ name, address, city, postalCode, contactNumber });
    };

    return (
        <Form onSubmit={handleSubmit} className="mt-4 p-3 border rounded bg-light">
            <h4 className="mb-3">Delivery Information</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="checkoutName">
                        <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                     <Form.Group className="mb-3" controlId="checkoutContact">
                        <Form.Label>Contact Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="e.g., 03001234567"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3" controlId="checkoutAddress">
                <Form.Label>Street Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    placeholder="e.g., House #123, Street 4, Sector G-10/2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                />
            </Form.Group>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="checkoutCity">
                        <Form.Label>City <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., Islamabad"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="checkoutPostalCode">
                        <Form.Label>Postal Code (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., 44000"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <div className="d-grid">
                <Button variant="primary" type="submit" size="lg">
                    Confirm Order (Cash on Delivery)
                </Button>
            </div>
        </Form>
    );
};

export default CheckoutForm;