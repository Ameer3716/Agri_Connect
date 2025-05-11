import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge, Alert, Spinner } from 'react-bootstrap';

// Define your API base URL using Vite's environment variable system
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CropPlanningPage = () => {
  const [cropPlans, setCropPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentPlan, setCurrentPlan] = useState({
    _id: null, // Use _id for MongoDB documents
    cropName: '',
    fieldName: '',
    area: '',
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'Planned',
    notes: ''
  });
  const [loading, setLoading] = useState(true); // For initial data load
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState(''); // For modal submission errors

  // Function to get auth token from localStorage
  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch crop plans
  const fetchCropPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          // Optionally redirect to login: navigate('/login');
          return;
      }
      const response = await fetch(`${API_BASE_URL}/farmer/cropplans`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Send token for protected routes
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to fetch crop plans: ${response.status}`);
      }
      const data = await response.json();
      setCropPlans(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCropPlans();
  }, [fetchCropPlans]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlan(prev => ({ ...prev, [name]: value }));
  };

  const handleShowModal = (planToEdit = null) => {
    if (planToEdit) {
      setCurrentPlan({
        _id: planToEdit._id,
        cropName: planToEdit.cropName,
        fieldName: planToEdit.fieldName,
        area: planToEdit.area,
        plantingDate: planToEdit.plantingDate ? new Date(planToEdit.plantingDate).toISOString().split('T')[0] : '',
        expectedHarvestDate: planToEdit.expectedHarvestDate ? new Date(planToEdit.expectedHarvestDate).toISOString().split('T')[0] : '',
        status: planToEdit.status,
        notes: planToEdit.notes || ''
      });
      setIsEditing(true);
    } else {
      setCurrentPlan({ _id: null, cropName: '', fieldName: '', area: '', plantingDate: '', expectedHarvestDate: '', status: 'Planned', notes: '' });
      setIsEditing(false);
    }
    setValidated(false);
    setSubmitError(''); // Clear previous modal errors
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

    setLoading(true); // Indicate loading for submit operation
    const token = getAuthToken();
    if (!token) {
        setSubmitError("Authentication failed. Cannot save plan.");
        setLoading(false);
        return;
    }

    const planData = { ...currentPlan };
    delete planData._id; // Don't send _id for create, and backend handles it for update via params

    const url = isEditing ? `${API_BASE_URL}/farmer/cropplans/${currentPlan._id}` : `${API_BASE_URL}/farmer/cropplans`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${isEditing ? 'update' : 'create'} crop plan`);
      }

      // const savedPlan = await response.json(); // Get the saved/updated plan from response
      await fetchCropPlans(); // Re-fetch all plans to update the list
      handleCloseModal();

    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err.message);
    } finally {
      setLoading(false); // Stop loading for submit operation
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this crop plan?')) {
      setLoading(true); // Indicate loading for delete operation
      setError('');
      const token = getAuthToken();
      if (!token) {
          setError("Authentication failed. Cannot delete plan.");
          setLoading(false);
          return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/farmer/cropplans/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to delete crop plan');
        }
        // setCropPlans(cropPlans.filter(p => p._id !== id)); // Optimistic update
        await fetchCropPlans(); // Re-fetch for consistency
      } catch (err) {
        console.error("Delete error:", err);
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading for delete operation
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'planned': return 'info';
      case 'planted': return 'primary';
      case 'growing': return 'success';
      case 'flowering': return 'warning';
      case 'harvest ready': return 'danger';
      case 'harvested': return 'secondary';
      case 'cancelled': return 'dark';
      default: return 'light';
    }
  };

  if (loading && cropPlans.length === 0) { // Show spinner only on initial load or during operations
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
        <p>Loading crop plans...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-3 align-items-center">
        <Col md={8}>
          <h2>Crop Planning & Management</h2>
          <p className="text-muted">Plan your crop cycles, track progress, and manage field operations.</p>
        </Col>
        <Col md={4} className="text-md-end">
          <Button variant="success" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle-fill me-2"></i>Add New Crop Plan
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {cropPlans.length > 0 ? (
        <Card className="shadow-sm">
            <Card.Header>Your Crop Plans</Card.Header>
            <Table responsive striped bordered hover className="mb-0">
                <thead>
                    <tr>
                        <th>Crop & Variety</th>
                        <th>Field</th>
                        <th>Area</th>
                        <th>Planting Date</th>
                        <th>Est. Harvest</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cropPlans.map(plan => (
                        <tr key={plan._id}> {/* Use _id from MongoDB */}
                            <td>{plan.cropName}</td>
                            <td>{plan.fieldName}</td>
                            <td>{plan.area}</td>
                            <td>{plan.plantingDate ? new Date(plan.plantingDate).toLocaleDateString() : 'N/A'}</td>
                            <td>{plan.expectedHarvestDate ? new Date(plan.expectedHarvestDate).toLocaleDateString() : 'N/A'}</td>
                            <td><Badge bg={getStatusBadge(plan.status)}>{plan.status}</Badge></td>
                            <td>
                                <Button variant="outline-primary" size="sm" className="me-1 py-0 px-1" onClick={() => handleShowModal(plan)} title="Edit">
                                    <i className="bi bi-pencil-square"></i>
                                </Button>
                                <Button variant="outline-danger" size="sm" className="py-0 px-1" onClick={() => handleDeletePlan(plan._id)} title="Delete">
                                    <i className="bi bi-trash"></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
      ) : (
        !loading && !error && <Alert variant="info">No crop plans found. Click "Add New Crop Plan" to get started.</Alert>
      )}


      {/* Add/Edit Crop Plan Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Crop Plan' : 'Add New Crop Plan'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="cropPlanName">
                    <Form.Label>Crop Name & Variety <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="cropName" value={currentPlan.cropName} onChange={handleInputChange} required />
                    <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="cropPlanField">
                    <Form.Label>Field Name/ID <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="fieldName" value={currentPlan.fieldName} onChange={handleInputChange} required />
                     <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
             <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="cropPlanArea">
                    <Form.Label>Area (e.g., Acres, Hectares) <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="area" value={currentPlan.area} onChange={handleInputChange} required />
                     <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="cropPlanStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={currentPlan.status} onChange={handleInputChange}>
                        <option value="Planned">Planned</option>
                        <option value="Planted">Planted</option>
                        <option value="Growing">Growing</option>
                        <option value="Flowering">Flowering</option>
                        <option value="Harvest Ready">Harvest Ready</option>
                        <option value="Harvested">Harvested</option>
                        <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="cropPlanPlantingDate">
                    <Form.Label>Planting Date</Form.Label>
                    <Form.Control type="date" name="plantingDate" value={currentPlan.plantingDate} onChange={handleInputChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="cropPlanHarvestDate">
                    <Form.Label>Expected Harvest Date</Form.Label>
                    <Form.Control type="date" name="expectedHarvestDate" value={currentPlan.expectedHarvestDate} onChange={handleInputChange} />
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3" controlId="cropPlanNotes">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} name="notes" value={currentPlan.notes} onChange={handleInputChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>Close</Button>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading && isEditing && 'Saving...'}
                {loading && !isEditing && 'Adding...'}
                {!loading && isEditing && 'Save Changes'}
                {!loading && !isEditing && 'Add Plan'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CropPlanningPage;