// src/components/marketplace/ProductFilterControls.jsx
import React from 'react';
import { Form, Row, Col, InputGroup, Button, Card } from 'react-bootstrap'; // Added Card import

// Example categories - in a real app, these might come from an API or be more dynamic
const categories = ["All", "Fruits", "Vegetables", "Grains", "Dairy", "Poultry", "Spices", "Herbs", "Processed Goods", "Farm Equipment", "Other"];

const ProductFilterControls = ({ filters, onFilterChange, onSearch }) => {
    // Handles changes for all controlled inputs in the filter form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    // Specifically handles the search button click or Enter key press on search input
    const handleSearchAction = () => {
        if (onSearch && typeof onSearch === 'function') {
            onSearch(filters.searchTerm); // Pass the current searchTerm to the parent's search handler
        }
    };

    return (
        <Card className="p-3 mb-4 shadow-sm">
            <Form onSubmit={(e) => { e.preventDefault(); handleSearchAction(); }}> {/* Allow form submission on Enter */}
                <Row className="g-3 align-items-end">
                    <Col lg={4} md={12} className="mb-2 mb-md-0"> {/* Full width on small, part on medium+ */}
                        <Form.Group controlId="filterSearchTerm">
                            <Form.Label className="fw-semibold">Search Products</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    name="searchTerm"
                                    placeholder="e.g., Organic Tomatoes, Wheat"
                                    value={filters.searchTerm || ''}
                                    onChange={handleInputChange}
                                    // onKeyPress={(e) => e.key === 'Enter' && handleSearchAction()} // Covered by form onSubmit
                                />
                                <Button variant="primary" onClick={handleSearchAction} type="submit"> {/* Ensure type="submit" if inside form */}
                                    <i className="bi bi-search"></i>
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col lg={3} md={4} sm={6} className="mb-2 mb-md-0">
                        <Form.Group controlId="filterCategory">
                            <Form.Label className="fw-semibold">Category</Form.Label>
                            <Form.Select
                                name="category"
                                value={filters.category || 'All'}
                                onChange={handleInputChange}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={2} md={3} sm={6} className="mb-2 mb-md-0">
                        <Form.Group controlId="filterMinPrice">
                            <Form.Label className="fw-semibold">Min Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="minPrice"
                                placeholder="PKR"
                                value={filters.minPrice || ''}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </Form.Group>
                    </Col>
                    <Col lg={2} md={3} sm={6} className="mb-2 mb-md-0">
                        <Form.Group controlId="filterMaxPrice">
                            <Form.Label className="fw-semibold">Max Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="maxPrice"
                                placeholder="PKR"
                                value={filters.maxPrice || ''}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </Form.Group>
                    </Col>
                    <Col lg={1} md={2} sm={12} className="d-grid"> {/* Reset button column */}
                         <Button 
                            variant="outline-secondary" 
                            onClick={() => onFilterChange({ searchTerm: '', category: 'All', minPrice: '', maxPrice: ''})}
                            title="Reset Filters"
                            className="mt-auto" // Aligns button if label makes others taller
                         >
                            <i className="bi bi-arrow-counterclockwise"></i>
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ProductFilterControls;