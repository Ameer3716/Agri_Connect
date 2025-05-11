// src/components/marketplace/ProductListingCard.jsx
import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap'; // Removed ButtonGroup as it's only for seller view
import { useCart } from '../../contexts/CartContext'; // Import useCart

const ProductListingCard = ({ listing, onEdit, onDelete, onToggleStatus, isSellerView = true }) => {
    const {
        productName,
        category,
        quantity,
        unit,
        pricePerUnit,
        description,
        imageUrl,
        status,
        location,
    } = listing;

    const { addToCart, cartItems } = useCart(); // Get addToCart from context

    const formatCurrency = (amount) => `PKR ${amount.toLocaleString()}`;

    const handleAddToCart = () => {
        // Pass the necessary product details to addToCart
        // Ensure 'listing' object has 'id', 'productName', 'pricePerUnit', 'imageUrl' (optional)
        addToCart({
            id: listing.id,
            productName: listing.productName,
            pricePerUnit: listing.pricePerUnit,
            imageUrl: listing.imageUrl,
            unit: listing.unit,
            // Add any other details you want in the cart item
        });
    };

    const itemInCart = cartItems.find(item => item.id === listing.id);
    const availableQuantity = quantity - (itemInCart ? itemInCart.quantity : 0);


    return (
        <Card className="h-100 shadow-sm product-listing-card">
            <Card.Img
                variant="top"
                src={imageUrl || `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(productName)}`}
                alt={productName}
                style={{ height: '180px', objectFit: 'cover' }}
            />
            <Card.Body className="d-flex flex-column">
                {isSellerView && ( // Show status badge only for seller's own listings page
                    <Badge
                        bg={status === 'active' ? 'success' : 'secondary'}
                        className="position-absolute top-0 end-0 m-2"
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                )}
                <Card.Title className="h5">{productName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted small">{category} {location && `| ${location}`}</Card.Subtitle>
                <Card.Text className="small flex-grow-1">
                    {description && description.length > 100 ? `${description.substring(0, 97)}...` : description}
                </Card.Text>
                <div>
                    <p className="mb-1">
                        <strong>Price:</strong> {formatCurrency(pricePerUnit)} / {unit}
                    </p>
                    <p className="mb-2">
                        <strong>Available:</strong> {isSellerView ? quantity : availableQuantity} {unit}
                         {!isSellerView && availableQuantity <= 0 && <Badge bg="danger" className="ms-2">Out of Stock</Badge>}
                    </p>
                </div>
            </Card.Body>
            <Card.Footer className="bg-light">
                {isSellerView ? (
                    <div className="d-grid gap-1 d-sm-flex justify-content-between">
                        <Button variant="outline-primary" size="sm" onClick={onEdit} title="Edit Listing" className="flex-fill me-sm-1 mb-1 mb-sm-0">
                            <i className="bi bi-pencil-square"></i> Edit
                        </Button>
                        <Button
                            variant={status === 'active' ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={onToggleStatus}
                            title={status === 'active' ? "Deactivate" : "Activate"}
                            className="flex-fill me-sm-1 mb-1 mb-sm-0"
                        >
                            <i className={`bi ${status === 'active' ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i> {status === 'active' ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={onDelete} title="Delete Listing" className="flex-fill">
                            <i className="bi bi-trash3-fill"></i> Delete
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="success"
                        className="w-100"
                        onClick={handleAddToCart}
                        disabled={availableQuantity <= 0} // Disable if out of stock
                    >
                        <i className="bi bi-cart-plus-fill me-2"></i>
                        {availableQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                )}
            </Card.Footer>
        </Card>
    );
};

export default ProductListingCard;