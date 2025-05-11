// src/pages/admin/MarketplaceManagementPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge, /* Modal, */ Alert, Tabs, Tab, ListGroup, Spinner // Modal removed if edit is gone
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Market trends data remains client-side
const initialMarketTrends = [ /* ... */ ];

const MarketplaceManagementPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [submitError, setSubmitError] = useState(''); // No longer needed if edit modal is gone

  const [marketTrends] = useState(initialMarketTrends);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  // const [showEditModal, setShowEditModal] = useState(false); // No longer needed
  // const [editingListing, setEditingListing] = useState(null); // No longer needed
  // const [validated, setValidated] = useState(false); // No longer needed for this simplified view

  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchAdminListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/admin/marketplace/listings`, {
        headers, credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch listings for admin');
      }
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminListings();
  }, [fetchAdminListings]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(listings.map(l => l.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [listings]);

  // Handler for permanent deletion by Admin
  const handlePermanentDeleteListing = async (listingId, productName) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the listing "${productName}" (ID: ${listingId})? This action cannot be undone.`)) {
        setLoading(true); // Indicate general loading or a specific deleting state
        setError('');
        try {
            const token = getAuthToken();
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await fetch(`${API_BASE_URL}/admin/marketplace/listings/${listingId}/permanent-delete`, { // New endpoint
                method: 'DELETE',
                headers,
                credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to permanently delete listing');
            }
            await fetchAdminListings(); // Re-fetch to update the list
            alert(`Listing "${productName}" permanently deleted.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
  };


  // Filtered listings logic (remains the same)
  const filteredListings = useMemo(() => {
    return listings.filter(l =>
        (l.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (l.farmer && l.farmer.name && l.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filterCategory === 'all' || l.category === filterCategory) &&
        (filterStatus === 'all' || l.status.toLowerCase() === filterStatus.toLowerCase())
    );
  }, [listings, searchTerm, filterCategory, filterStatus]);

  const getStatusBadge = (status) => { /* ... (same as before) ... */ };
  // const getTrendIcon = (trend) => { /* ... (same as before) ... */ }; // Not used in listings tab

  if (loading && listings.length === 0) {
    return <Container className="text-center mt-5"><Spinner animation="border" variant="success" /><p>Loading marketplace data...</p></Container>;
  }

  return (
    <Container fluid>
      <h2 className="mb-3">Marketplace Monitoring & Management</h2>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Tabs defaultActiveKey="listings" id="marketplace-tabs-admin" className="mb-3 nav-pills">
        <Tab eventKey="listings" title="Product Listings">
          <Card className="shadow-sm">
            <Card.Header>
              <Row className="g-2 align-items-center"> {/* Filters */}
                <Col md={4} sm={6} xs={12}>
                  <InputGroup size="sm">
                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                    <Form.Control placeholder="Search product/farmer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </InputGroup>
                </Col>
                <Col md={3} sm={6} xs={12}><Form.Select size="sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>{categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}</Form.Select></Col>
                <Col md={3} sm={6} xs={12}><Form.Select size="sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="all">All Statuses</option><option value="active">Active</option><option value="pending approval">Pending Approval</option><option value="removed">Removed By Admin</option><option value="inactive">Inactive (By Farmer)</option><option value="sold">Sold</option></Form.Select></Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {/* Loading spinner for table content */}
              {loading && listings.length > 0 ? <div className="text-center p-3"><Spinner size="sm" /> Loading more...</div> : null}
              
              {!loading && filteredListings.length === 0 ? (
                <Alert variant="info" className="text-center">No listings match the current filters.</Alert>
              ) : (
                <Table responsive striped bordered hover size="sm" className="align-middle">
                  <thead>
                    <tr><th>ID</th><th>Product</th><th>Farmer (ID)</th><th>Category</th><th>Price/Unit</th><th>Qty</th><th>Status</th><th className="text-center">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredListings.map(l => (
                      <tr key={l._id} className={l.reported ? 'table-danger' : ''}>
                        <td>{l._id.slice(-6).toUpperCase()}</td>
                        <td>{l.productName} {l.reported && <Badge bg="danger" pill title={l.reportDetails || "Reported"}>!</Badge>}</td>
                        <td>
                            {l.farmer ? (<Link to={`/admin/users/${l.farmer._id}`}>{l.farmer.name}</Link>) : ('N/A')}
                            {l.farmer && ` (${l.farmer._id ? l.farmer._id.slice(-4) : 'N/A'})`}
                        </td>
                        <td>{l.category}</td>
                        <td>PKR {l.pricePerUnit}/{l.unit}</td>
                        <td>{l.quantity} {l.unit?.includes('kg') || l.unit?.includes('Kg') ? '' : l.unit }</td>
                        <td><Badge bg={getStatusBadge(l.status)}>{l.status}</Badge></td>
                        <td className="text-center">
                          {/* Simplified Actions: Only Permanent Delete */}
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="py-0 px-1" 
                            onClick={() => handlePermanentDeleteListing(l._id, l.productName)} 
                            title="Permanently Delete Listing"
                            disabled={loading}
                          >
                            <i className="bi bi-trash-fill"></i> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
        {/* Other Tabs (Market Overview, Reported Listings) - keep their existing client-side/simplified logic */}
        <Tab eventKey="trends" title="Market Overview">
             {/* ... Your existing Market Trends Tab content ... */}
        </Tab>
        <Tab eventKey="reports" title={<span><i className="bi bi-flag-fill text-danger me-1"></i> Reported Listings <Badge bg="danger">{listings.filter(l=>l.reported).length || 0}</Badge></span>}>
            {/* ... Your existing Reported Listings Tab content, but it can use the dynamic `listings` for the count ... */}
            {/* If you want reported listings to also have just a delete option, update its buttons too */}
        </Tab>
      </Tabs>

      {/* Edit Listing Modal is removed as per request for simplification in this step */}
      {/* If you need it back later, you can re-add the Modal component and its related state/handlers */}

    </Container>
  );
};

export default MarketplaceManagementPage;