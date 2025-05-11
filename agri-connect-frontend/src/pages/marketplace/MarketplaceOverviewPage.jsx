import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap'; // Added Spinner
import ProductListingCard from '../../components/marketplace/ProductListingCard';
import ProductFilterControls from '../../components/marketplace/ProductFilterControls';
// import { useNavigate } from 'react-router-dom'; // useNavigate not used directly in this version

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MarketplaceOverviewPage = () => {
    // const navigate = useNavigate(); // Keep if needed for other actions
    const [allListings, setAllListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        // location: '', // Example for future filter
        // sortBy: 'date_desc' // Example for future sorting
    });

    const fetchAllMarketplaceListings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // This endpoint is public, so no auth token needed for browsing
            const response = await fetch(`${API_BASE_URL}/marketplace/listings`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch marketplace listings');
            }
            const data = await response.json();
            setAllListings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllMarketplaceListings();
    }, [fetchAllMarketplaceListings]);

    const displayedListings = useMemo(() => {
        return allListings.filter(listing => {
            // All listings from API are already 'active' as per backend query
            // if (listing.status !== 'active') return false; // This check might be redundant if API guarantees active

            if (filters.category !== 'All' && listing.category !== filters.category) {
                return false;
            }

            const price = parseFloat(listing.pricePerUnit);
            if (filters.minPrice && !isNaN(parseFloat(filters.minPrice)) && price < parseFloat(filters.minPrice)) {
                return false;
            }
            if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice)) && price > parseFloat(filters.maxPrice)) {
                return false;
            }

            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                const nameMatch = listing.productName.toLowerCase().includes(searchLower);
                const descMatch = listing.description.toLowerCase().includes(searchLower);
                const categoryNameMatch = listing.category.toLowerCase().includes(searchLower);
                const locationMatch = listing.location?.toLowerCase().includes(searchLower);
                const sellerNameMatch = listing.farmer?.name?.toLowerCase().includes(searchLower); // If farmer populated

                if (!(nameMatch || descMatch || categoryNameMatch || locationMatch || sellerNameMatch)) {
                    return false;
                }
            }
            return true;
        });
        // Add sorting logic here if filters.sortBy is implemented
    }, [allListings, filters]);


    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };
    
    const handleSearchFromFilters = (searchTermFromControl) => {
        // Update filters directly if ProductFilterControls doesn't do it via onFilterChange
        // For now, assuming onFilterChange in ProductFilterControls updates the main filters state.
        console.log("Marketplace search initiated with term:", searchTermFromControl);
    };

    const handleInitiateTransaction = (listing) => {
        // This is a placeholder. Real implementation would involve more complex logic.
        // Possibly navigate to a detailed product page or an order creation page.
        alert(`Viewing details for: ${listing.productName}\nSeller: ${listing.farmer?.name || 'N/A'}\nPrice: PKR ${listing.pricePerUnit}/${listing.unit}`);
        // navigate(`/marketplace/product/${listing._id}`); // Example navigation
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="success" />
                <p>Loading marketplace products...</p>
            </Container>
        );
    }

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-1">
                <h2 className="mb-0">Browse Marketplace Products</h2>
            </div>
            <p className="text-muted mb-3">Find fresh agricultural products from various sellers.</p>

            <ProductFilterControls 
                filters={filters} 
                onFilterChange={handleFilterChange}
                onSearch={handleSearchFromFilters}
                // Pass unique categories from listings for the dropdown if needed
                // categories={['All', ...new Set(allListings.map(l => l.category))]}
            />

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            
            {!loading && displayedListings.length === 0 && !error ? (
                <Alert variant="light" className="text-center p-4 border mt-3">
                    <i className="bi bi-emoji-frown fs-3 d-block mb-2"></i>
                    <h5>No products found</h5>
                    <p className="mb-0">Try adjusting your search term or filters.</p>
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} xl={4} className="g-4 mt-2">
                    {displayedListings.map(listing => (
                        <Col key={listing._id}> {/* Use _id from MongoDB */}
                            <ProductListingCard
                                listing={listing}
                                isSellerView={false}
                                onInitiateTransaction={() => handleInitiateTransaction(listing)}
                            />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default MarketplaceOverviewPage;