import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MarketPriceManagementPage = () => {
  const [prices, setPrices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentPrice, setCurrentPrice] = useState({
    _id: null, crop: '', price: '', unit: '40kg', source: '', notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/farmer/marketprices`, {
        headers, credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch market prices');
      }
      const data = await response.json();
      setPrices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPrice(prev => ({ ...prev, [name]: value }));
  };

  const handleShowModal = (priceToEdit = null) => {
    if (priceToEdit) {
      setCurrentPrice(priceToEdit);
      setIsEditing(true);
    } else {
      setCurrentPrice({ _id: null, crop: '', price: '', unit: '40kg', source: '', notes: '' });
      setIsEditing(false);
    }
    setValidated(false);
    setSubmitError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    setSubmitError('');

    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }

    setLoading(true); // Use general loading for submit
    const token = getAuthToken();
    const priceData = { ...currentPrice };
    delete priceData._id;

    const url = isEditing ? `${API_BASE_URL}/farmer/marketprices/${currentPrice._id}` : `${API_BASE_URL}/farmer/marketprices`;
    const method = isEditing ? 'PUT' : 'POST';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method, headers, body: JSON.stringify(priceData), credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${isEditing ? 'update' : 'add'} price`);
      }
      await fetchPrices();
      handleCloseModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrice = async (id) => {
    if (window.confirm('Are you sure you want to delete this price entry?')) {
      setLoading(true);
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      try {
        const response = await fetch(`${API_BASE_URL}/farmer/marketprices/${id}`, {
          method: 'DELETE', headers, credentials: 'include',
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to delete price');
        }
        await fetchPrices();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading && prices.length === 0) {
    return <Container className="text-center mt-5"><Spinner animation="border" variant="success" /><p>Loading market prices...</p></Container>;
  }

  return (
    <Container fluid>
      <Row className="mb-3 align-items-center">
        <Col md={8}>
          <h2>Market Price Management</h2>
          <p className="text-muted">Track observed or target market prices.</p>
        </Col>
        <Col md={4} className="text-md-end">
          <Button variant="success" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle-fill me-2"></i>Add New Price Entry
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {prices.length > 0 ? (
        <Row>
            {prices.map(p => (
                <Col md={6} lg={4} key={p._id} className="mb-3 d-flex">
                    <Card className="w-100 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                            <Card.Title>{p.crop}</Card.Title>
                            <Card.Subtitle className="mb-2 text-success fw-bold fs-5">
                                PKR {parseFloat(p.price).toLocaleString()} / {p.unit}
                            </Card.Subtitle>
                            <Card.Text className="mb-1">
                                <small><strong>Source:</strong> {p.source || 'N/A'}</small>
                            </Card.Text>
                            {p.notes && <Card.Text className="mb-1 fst-italic"><small>Notes: {p.notes}</small></Card.Text>}
                           <div className="mt-auto"> {/* Pushes footer content down */}
                             <Card.Text>
                                 <small className="text-muted">Last Updated: {formatDate(p.updatedAt)}</small>
                             </Card.Text>
                           </div>
                        </Card.Body>
                        <Card.Footer className="text-end bg-light">
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(p)} title="Edit">
                                <i className="bi bi-pencil-square"></i>
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeletePrice(p._id)} title="Delete">
                                <i className="bi bi-trash"></i>
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            ))}
        </Row>
      ) : (
        !loading && !error && <Alert variant="info">No market price entries. Click "Add New Price Entry".</Alert>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Price Entry' : 'Add New Price Entry'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            <Form.Group className="mb-3" controlId="cropNameModal">
              <Form.Label>Crop Name <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="crop" value={currentPrice.crop} onChange={handleInputChange} required placeholder="e.g., Wheat"/>
              <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
            </Form.Group>
            <Row>
                <Col md={7}>
                    <Form.Group className="mb-3" controlId="cropPriceModal">
                    <Form.Label>Price (PKR) <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="number" name="price" value={currentPrice.price} onChange={handleInputChange} required placeholder="e.g., 4500" step="any"/>
                    <Form.Control.Feedback type="invalid">Valid price required.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={5}>
                    <Form.Group className="mb-3" controlId="cropUnitModal">
                    <Form.Label>Unit <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="unit" value={currentPrice.unit} onChange={handleInputChange} required placeholder="e.g., 40kg"/>
                     <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3" controlId="priceSourceModal">
              <Form.Label>Source</Form.Label>
              <Form.Control type="text" name="source" value={currentPrice.source} onChange={handleInputChange} placeholder="e.g., Local Market"/>
            </Form.Group>
             <Form.Group className="mb-3" controlId="priceNotesModal">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} name="notes" value={currentPrice.notes} onChange={handleInputChange} placeholder="Details or observations"/>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>Close</Button>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading && (isEditing ? 'Saving...' : 'Adding...')}
                {!loading && (isEditing ? 'Save Changes' : 'Add Entry')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MarketPriceManagementPage;