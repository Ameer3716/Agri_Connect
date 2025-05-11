import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import ProductListingCard from '../../components/marketplace/ProductListingCard';
import ProductListingFormModal from '../../components/marketplace/ProductListingFormModal';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductListingsPage = () => {
    const [userListings, setUserListings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingListing, setEditingListing] = useState(null); // Stores the full listing object for editing
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState(''); // For modal submission errors

    const getAuthToken = () => localStorage.getItem('authToken');

    const fetchUserListings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/farmer/listings`, {
                headers, credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch listings');
            }
            const data = await response.json();
            setUserListings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserListings();
    }, [fetchUserListings]);

    const handleShowCreateModal = () => {
        setEditingListing(null); // Clear any existing editing state
        setSubmitError('');
        setShowModal(true);
    };

    const handleShowEditModal = (listing) => {
        setEditingListing(listing); // Set the listing to be edited
        setSubmitError('');
        setShowModal(true);
    };

    const handleSaveListing = async (listingData) => {
        setLoading(true); // Indicate loading for save operation
        setSubmitError('');
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const url = editingListing
            ? `${API_BASE_URL}/farmer/listings/${editingListing._id}` // Use _id from MongoDB document
            : `${API_BASE_URL}/farmer/listings`;
        const method = editingListing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method, headers, body: JSON.stringify(listingData), credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Failed to ${editingListing ? 'update' : 'create'} listing`);
            }
            await fetchUserListings(); // Re-fetch to get the latest list (including new/updated one)
            setShowModal(false);
            setEditingListing(null);
        } catch (err) {
            setSubmitError(err.message); // Show error inside the modal
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            setLoading(true);
            setError(''); // Clear general page error
            const token = getAuthToken();
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            try {
                const response = await fetch(`${API_BASE_URL}/farmer/listings/${listingId}`, {
                    method: 'DELETE', headers, credentials: 'include',
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to delete listing');
                }
                await fetchUserListings(); // Re-fetch to update the list
            } catch (err) {
                setError(err.message); // Show general page error for delete
            } finally {
                setLoading(false);
            }
        }
    };

    const handleToggleStatus = async (listingId) => {
        setLoading(true); // Can use general loading or a specific one per card
        setError('');
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const listingToToggle = userListings.find(l => l._id === listingId);
        if (!listingToToggle) return;

        const newStatus = listingToToggle.status === 'active' ? 'inactive' : 'active';

        try {
            const response = await fetch(`${API_BASE_URL}/farmer/listings/${listingId}`, {
                method: 'PUT', headers, body: JSON.stringify({ status: newStatus }), credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to toggle status');
            }
            await fetchUserListings(); // Re-fetch
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && userListings.length === 0) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="success" />
                <p>Loading your listings...</p>
            </Container>
        );
    }

    return (
        <Container fluid>
            <Row className="align-items-center mb-4">
                <Col>
                    <h2>My Product Listings</h2>
                    <p className="text-muted">Manage products for the marketplace.</p>
                </Col>
                <Col xs="auto">
                    <Button variant="success" onClick={handleShowCreateModal} disabled={loading}>
                        <i className="bi bi-plus-circle-fill me-2"></i>Create New Listing
                    </Button>
                </Col>
            </Row>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            {userListings.length === 0 && !loading ? (
                <Alert variant="info">You haven't listed any products yet.</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {userListings.map(listing => (
                        <Col key={listing._id}> {/* Use _id from MongoDB */}
                            <ProductListingCard
                                listing={listing}
                                onEdit={() => handleShowEditModal(listing)}
                                onDelete={() => handleDeleteListing(listing._id)}
                                onToggleStatus={() => handleToggleStatus(listing._id)}
                                isSellerView={true}
                                // Pass loading state if individual card actions should show loading
                            />
                        </Col>
                    ))}
                </Row>
            )}
            <ProductListingFormModal
                show={showModal}
                onHide={() => { setShowModal(false); setEditingListing(null); }}
                onSave={handleSaveListing}
                existingListing={editingListing}
                loading={loading} // Pass loading state to modal for submit button
                submitError={submitError} // Pass submit error to modal
            />
            <div className="mt-4">
                <Link to="/dashboard" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left-circle me-2"></i>Back to Dashboard
                </Link>
            </div>
        </Container>
    );
};
export default ProductListingsPage;