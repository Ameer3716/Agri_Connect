import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Form, Modal, Badge, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TaskManagementPage = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    _id: null, task: '', description: '', due: '', priority: 'Medium', status: 'Pending', assignedTo: 'Self', notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/farmer/tasks`, {
        headers: headers,
        credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('action') === 'add') {
      handleShowModal();
    }
  }, [location.search]); // Dependency on location.search

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask(prev => ({ ...prev, [name]: value }));
  };

  const handleShowModal = (taskToEdit = null) => {
    if (taskToEdit) {
      setCurrentTask({
        ...taskToEdit,
        due: taskToEdit.due ? new Date(taskToEdit.due).toISOString().split('T')[0] : ''
      });
      setIsEditing(true);
    } else {
      setCurrentTask({ _id: null, task: '', description: '', due: '', priority: 'Medium', status: 'Pending', assignedTo: 'Self', notes: '' });
      setIsEditing(false);
    }
    setValidated(false);
    setSubmitError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    // setCurrentTask({ _id: null, task: '', description: '', due: '', priority: 'Medium', status: 'Pending', assignedTo: 'Self', notes: '' });
    if (new URLSearchParams(location.search).get('action') === 'add') {
        navigate('/tasks', { replace: true });
    }
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

    setLoading(true); // Use general loading state for submit
    const token = getAuthToken();
    const taskData = { ...currentTask };
    delete taskData._id;

    const url = isEditing ? `${API_BASE_URL}/farmer/tasks/${currentTask._id}` : `${API_BASE_URL}/farmer/tasks`;
    const method = isEditing ? 'PUT' : 'POST';

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(taskData),
        credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
      }
      await fetchTasks();
      handleCloseModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      try {
        const response = await fetch(`${API_BASE_URL}/farmer/tasks/${id}`, {
          method: 'DELETE',
          headers: headers,
          credentials: 'include',
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to delete task');
        }
        await fetchTasks();
      } catch (err) {
        setError(err.message); // Show general error for delete
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const originalTasks = [...tasks]; // Keep a copy for optimistic update revert
    const updatedTask = tasks.find(t => t._id === id);
    if (!updatedTask) return;

    // Optimistic UI update
    setTasks(tasks.map(t => (t._id === id ? { ...t, status: newStatus } : t)));

    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE_URL}/farmer/tasks/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ status: newStatus }), // Only send the status to update
        credentials: 'include',
      });
      if (!response.ok) {
        setTasks(originalTasks); // Revert optimistic update on error
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update task status');
      }
      // No need to re-fetch if only status changed and backend confirms
      // await fetchTasks(); // Or re-fetch if you prefer full data consistency
    } catch (err) {
      setError(err.message);
      setTasks(originalTasks); // Revert on error
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'secondary';
      case 'in progress': return 'primary';
      case 'completed': return 'success';
      case 'on hold': return 'warning';
      case 'cancelled': return 'dark';
      default: return 'light';
    }
  };

  const filteredTasks = tasks.filter(task =>
    (task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterStatus === 'all' || task.status.toLowerCase() === filterStatus.toLowerCase())
  ).sort((a, b) => new Date(a.due) - new Date(b.due));


  if (loading && tasks.length === 0) {
    return <Container className="text-center mt-5"><Spinner animation="border" variant="success" /><p>Loading tasks...</p></Container>;
  }

  return (
    <Container fluid>
      <Row className="mb-3 align-items-center">
        <Col md={8}>
          <h2>Task Management</h2>
          <p className="text-muted">View, add, and manage your farm tasks.</p>
        </Col>
        <Col md={4} className="text-md-end">
          <Button variant="success" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle-fill me-2"></i>Add New Task
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Header>
            <Row className="gy-2 align-items-center">
                <Col md={6} lg={7}>
                    <InputGroup>
                        <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={6} lg={5}>
                    <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                </Col>
            </Row>
        </Card.Header>
        {filteredTasks.length > 0 ? (
            <ListGroup variant="flush">
            {filteredTasks.map(task => (
                <ListGroup.Item key={task._id}>
                <Row className="align-items-center gy-2">
                    <Col xs={12} md={5}>
                    <h5 className="mb-1">{task.task}</h5>
                    <p className="mb-1 text-muted small">{task.description}</p>
                    </Col>
                    <Col xs={6} md={2} className="text-start">
                        <Badge bg={getPriorityBadge(task.priority)} className="me-2 mb-1 mb-md-0">{task.priority}</Badge>
                        <Badge bg={getStatusBadge(task.status)}>{task.status}</Badge>
                    </Col>
                    <Col xs={6} md={2} className="text-start text-md-start">
                        <small>Due: {task.due ? new Date(task.due).toLocaleDateString() : 'N/A'}</small><br/>
                        <small>To: {task.assignedTo || 'N/A'}</small>
                    </Col>
                    <Col xs={12} md={3} className="text-md-end mt-2 mt-md-0">
                        <Button variant="outline-primary" size="sm" className="me-1 mb-1 mb-md-0" onClick={() => handleShowModal(task)} title="Edit">
                            <i className="bi bi-pencil-square"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" className="me-1 mb-1 mb-md-0" onClick={() => handleDeleteTask(task._id)} title="Delete">
                            <i className="bi bi-trash"></i>
                        </Button>
                         <Form.Select 
                            size="sm" 
                            className="d-inline-block w-auto ms-md-1" 
                            style={{maxWidth: '120px'}}
                            value={task.status} 
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            title="Change Status"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Cancelled">Cancelled</option>
                        </Form.Select>
                    </Col>
                </Row>
                {task.notes && <p className="mt-2 mb-0 fst-italic small text-muted">Notes: {task.notes}</p>}
                </ListGroup.Item>
            ))}
            </ListGroup>
        ) : (
            !loading && <Card.Body className="text-center text-muted">No tasks found matching your criteria.</Card.Body>
        )}
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Task' : 'Add New Task'}</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            <Form.Group className="mb-3" controlId="taskName">
              <Form.Label>Task Name <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="task" value={currentTask.task} onChange={handleInputChange} required placeholder="e.g., Irrigate Field X"/>
              <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="taskDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} name="description" value={currentTask.description} onChange={handleInputChange} placeholder="Detailed description"/>
            </Form.Group>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="taskDueDate">
                    <Form.Label>Due Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="date" name="due" value={currentTask.due} onChange={handleInputChange} required/>
                    <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="taskPriority">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select name="priority" value={currentTask.priority} onChange={handleInputChange}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
             <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="taskStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={currentTask.status} onChange={handleInputChange}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="taskAssignedTo">
                    <Form.Label>Assigned To</Form.Label>
                    <Form.Control type="text" name="assignedTo" value={currentTask.assignedTo} onChange={handleInputChange} placeholder="e.g., Self, Worker"/>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3" controlId="taskNotes">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} name="notes" value={currentTask.notes} onChange={handleInputChange} placeholder="Additional notes"/>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>Close</Button>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading && (isEditing ? 'Saving...' : 'Adding...')}
                {!loading && (isEditing ? 'Save Changes' : 'Add Task')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TaskManagementPage;