// src/components/marketplace/CartItem.jsx
import React from 'react';
import { ListGroup, Row, Col, Image, Button, Form, InputGroup } from 'react-bootstrap';
import { useCart } from '../../contexts/CartContext';

const CartItem = ({ item }) => {
    const { removeFromCart, updateQuantity } = useCart();

    const handleQuantityChange = (e) => {
        const newQty = parseInt(e.target.value);
        if (!isNaN(newQty)) {
            updateQuantity(item.id, newQty);
        }
    };
    
    const incrementQuantity = () => updateQuantity(item.id, item.quantity + 1);
    const decrementQuantity = () => updateQuantity(item.id, item.quantity - 1);


    const formatCurrency = (amount) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <ListGroup.Item className="mb-3 shadow-sm">
            <Row className="align-items-center">
                <Col xs={3} md={2}>
                    <Image
                        src={item.imageUrl || `https://via.placeholder.com/100x100.png?text=${encodeURIComponent(item.productName)}`}
                        alt={item.productName}
                        thumbnail
                        fluid
                    />
                </Col>
                <Col xs={9} md={4}>
                    <h6 className="mb-0">{item.productName}</h6>
                    <small className="text-muted">Price: PKR {formatCurrency(item.pricePerUnit)} / {item.unit}</small>
                </Col>
                <Col xs={7} md={3} className="mt-2 mt-md-0">
                     <InputGroup size="sm" style={{maxWidth: '130px'}}>
                        <Button variant="outline-secondary" onClick={decrementQuantity} disabled={item.quantity <= 1}>-</Button>
                        <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={handleQuantityChange}
                            className="text-center"
                            min="1"
                        />
                        <Button variant="outline-secondary" onClick={incrementQuantity}>+</Button>
                    </InputGroup>
                </Col>
                <Col xs={3} md={2} className="text-md-end mt-2 mt-md-0">
                    <span className="fw-bold">PKR {formatCurrency(item.pricePerUnit * item.quantity)}</span>
                </Col>
                <Col xs={2} md={1} className="text-end mt-2 mt-md-0">
                    <Button variant="outline-danger" size="sm" onClick={() => removeFromCart(item.id)} title="Remove item">
                        <i className="bi bi-trash3-fill"></i>
                    </Button>
                </Col>
            </Row>
        </ListGroup.Item>
    );
};

export default CartItem;