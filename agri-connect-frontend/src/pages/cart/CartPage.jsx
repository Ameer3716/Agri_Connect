// src/pages/cart/CartPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Button, Alert, Card, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem from '../../components/marketplace/CartItem';
import CheckoutForm from '../../components/cart/CheckoutForm';

const CartPage = () => {
    const { cartItems, clearCart, getCartTotal, itemCount } = useCart();
    const navigate = useNavigate();
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    const handleConfirmOrder = (deliveryInfo) => {
        // In a real app, send order to backend here
        console.log("Order Confirmed with delivery info:", deliveryInfo);
        console.log("Cart Items:", cartItems);
        console.log("Total Amount:", getCartTotal());

        setOrderDetails({
            items: [...cartItems], // Store a copy of items at time of order
            total: getCartTotal(),
            deliveryInfo: deliveryInfo
        });
        setOrderConfirmed(true);
        clearCart(); // Clear the cart after order confirmation
        setShowCheckoutForm(false);
    };

    const formatCurrency = (amount) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });


    if (orderConfirmed && orderDetails) {
        return (
            <Container className="mt-4">
                <Alert variant="success" className="text-center p-4">
                    <i className="bi bi-check-circle-fill fs-1 d-block mb-3 text-success"></i>
                    <h2>Order Confirmed!</h2>
                    <p className="lead">Thank you for your purchase, {orderDetails.deliveryInfo.name}!</p>
                    <p>Your order total was <strong>PKR {formatCurrency(orderDetails.total)}</strong> (Cash on Delivery).</p>
                    <p>It will be delivered to:<br/>
                        {orderDetails.deliveryInfo.address}, {orderDetails.deliveryInfo.city} {orderDetails.deliveryInfo.postalCode || ''}<br/>
                        Contact: {orderDetails.deliveryInfo.contactNumber}
                    </p>
                    <p className="mb-0">Your order will be delivered within <strong>5 working days</strong>.</p>
                    <hr />
                    <Button variant="primary" onClick={() => navigate('/marketplace')}>
                        Continue Shopping
                    </Button>
                </Alert>
            </Container>
        );
    }


    return (
        <Container className="mt-4">
            <Row className="justify-content-between align-items-center mb-3">
                <Col>
                    <h2>Your Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h2>
                </Col>
                {cartItems.length > 0 && !showCheckoutForm && (
                    <Col xs="auto">
                         <Button variant="danger" onClick={clearCart} size="sm">
                            <i className="bi bi-cart-x-fill me-1"></i> Clear Cart
                        </Button>
                    </Col>
                )}
            </Row>

            {cartItems.length === 0 ? (
                <Alert variant="info">
                    Your cart is empty. <Link to="/marketplace">Start shopping!</Link>
                </Alert>
            ) : (
                <Row>
                    <Col lg={8}>
                        <ListGroup variant="flush">
                            {cartItems.map(item => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </ListGroup>
                    </Col>
                    <Col lg={4} className="mt-4 mt-lg-0">
                        <Card>
                            <Card.Body>
                                <Card.Title>Order Summary</Card.Title>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <span>Subtotal:</span>
                                        <span>PKR {formatCurrency(getCartTotal())}</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between">
                                        <span>Shipping:</span>
                                        <span>PKR {formatCurrency(0)} (Free for now)</span>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="d-flex justify-content-between fw-bold fs-5">
                                        <span>Total:</span>
                                        <span>PKR {formatCurrency(getCartTotal())}</span>
                                    </ListGroup.Item>
                                </ListGroup>
                                {showCheckoutForm ? (
                                    <CheckoutForm onConfirmOrder={handleConfirmOrder} />
                                ) : (
                                    <div className="d-grid mt-3">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={() => setShowCheckoutForm(true)}
                                        >
                                            Proceed to Checkout
                                        </Button>
                                    </div>
                                )}
                                 <Button variant="outline-secondary" className="w-100 mt-2" onClick={() => navigate('/marketplace')}>
                                    <i className="bi bi-arrow-left me-1"></i> Continue Shopping
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default CartPage;