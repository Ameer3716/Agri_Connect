import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

const categories = ["Fruits", "Vegetables", "Grains", "Dairy", "Poultry", "Livestock", "Spices", "Herbs", "Processed Goods", "Other"];
const units = ["kg", "gram", "liter", "ml", "dozen", "piece", "bunch", "bag (e.g., 40kg)", "maund", "ton"];

const ProductListingFormModal = ({ show, onHide, onSave, existingListing }) => {
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('kg');
    const [pricePerUnit, setPricePerUnit] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState('active'); // 'active' or 'inactive'

    useEffect(() => {
        if (existingListing) {
            setProductName(existingListing.productName || '');
            setCategory(existingListing.category || '');
            setQuantity(existingListing.quantity?.toString() || '');
            setUnit(existingListing.unit || 'kg');
            setPricePerUnit(existingListing.pricePerUnit?.toString() || '');
            setDescription(existingListing.description || '');
            setLocation(existingListing.location || '');
            setImageUrl(existingListing.imageUrl || '');
            setStatus(existingListing.status || 'active');
        } else {
            // Reset for new form
            setProductName('');
            setCategory('');
            setQuantity('');
            setUnit('kg');
            setPricePerUnit('');
            setDescription('');
            setLocation('');
            setImageUrl('');
            setStatus('active');
        }
    }, [existingListing, show]); // Re-populate form when 'existingListing' or 'show' changes

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!productName || !category || !quantity || !unit || !pricePerUnit || !description || !status) {
            alert("Please fill in all required fields.");
            return;
        }
        onSave({
            productName,
            category,
            quantity: parseFloat(quantity),
            unit,
            pricePerUnit: parseFloat(pricePerUnit),
            description,
            location,
            imageUrl,
            status,
        });
        onHide(); // Close modal after save
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {existingListing ? 'Edit Product Listing' : 'Create New Product Listing'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3" controlId="listingProductName">
                                <Form.Label>Product Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="listingCategory">
                                <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                    <option value="">Select...</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="listingQuantity">
                                <Form.Label>Quantity Available <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                    min="0"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="listingUnit">
                                <Form.Label>Unit <span className="text-danger">*</span></Form.Label>
                                <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)} required>
                                     {units.map(u => <option key={u} value={u}>{u}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="listingPrice">
                                <Form.Label>Price per Unit (PKR) <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    value={pricePerUnit}
                                    onChange={(e) => setPricePerUnit(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="listingDescription">
                        <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                     <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="listingLocation">
                                <Form.Label>Product Location (Optional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., Farm Plot B, Sahiwal"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                         <Col md={6}>
                            <Form.Group className="mb-3" controlId="listingStatus">
                                <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)} required>
                                    <option value="active">Active (Visible in Marketplace)</option>
                                    <option value="inactive">Inactive (Hidden)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="listingImageUrl">
                        <Form.Label>Image URL (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                         <Form.Text className="text-muted">
                            Provide a direct link to an image of your product.
                        </Form.Text>
                    </Form.Group>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <Button variant="secondary" onClick={onHide}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {existingListing ? 'Save Changes' : 'Create Listing'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ProductListingFormModal;