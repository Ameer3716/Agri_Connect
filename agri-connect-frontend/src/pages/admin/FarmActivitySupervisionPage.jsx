import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Modal, Alert, Spinner } from 'react-bootstrap';
// import { Link } from 'react-router-dom'; // Uncomment if you add user detail links

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FarmActivitySupervisionPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all'); // Assuming region is part of User model
  const [filterUserType, setFilterUserType] = useState('all');

  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageValidated, setMessageValidated] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSendStatus, setMessageSendStatus] = useState({ type: '', msg: '' });

  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchAllUsersForAdmin = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
        const token = getAuthToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_BASE_URL}/admin/users/all`, { 
            headers, credentials: 'include',
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to fetch users');
        }
        const data = await response.json();
        // Backend now sends userId and userName directly in the transformed data
        setUsers(data); 
    } catch (err) {
        setError(`Failed to load users: ${err.message}.`);
        console.error("Error fetching users:", err);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsersForAdmin();
  }, [fetchAllUsersForAdmin]);

  const regions = useMemo(() => {
    const uniqueRegions = new Set(users.map(u => u.region).filter(Boolean));
    return ['all', ...Array.from(uniqueRegions)];
  }, [users]);

  const userTypes = useMemo(() => {
    // Backend already filters out Admins, so this will only show 'Farmer', 'Buyer'
    const uniqueUserTypes = new Set(users.map(u => u.userType).filter(Boolean));
    return ['all', ...Array.from(uniqueUserTypes)];
  }, [users]);

  const handleShowSendMessageModal = (user) => {
    setSelectedUser(user);
    setMessageSubject('');
    setMessageBody(`Dear ${user.userName || user.name},\n\n`); // Use userName or name
    setMessageValidated(false);
    setMessageSendStatus({ type: '', msg: '' });
    setShowSendMessageModal(true);
  };

  const handleSendMessage = async (event) => {
    // ... (send message logic as before, ensure selectedUser.userId or selectedUser._id is used)
    const form = event.currentTarget;
    event.preventDefault(); event.stopPropagation();
    setMessageSendStatus({ type: '', msg: '' });
    if (form.checkValidity() === false) { setMessageValidated(true); return; }
    setSendingMessage(true);
    try {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}/admin/communication/send-message`, {
            method: 'POST', headers,
            body: JSON.stringify({ userId: selectedUser._id, subject: messageSubject, messageBody: messageBody }),
            credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send message');
        setMessageSendStatus({ type: 'success', msg: data.message || 'Message sent!' });
        setTimeout(() => setShowSendMessageModal(false), 2000);
    } catch (err) {
        setMessageSendStatus({ type: 'danger', msg: err.message || 'Error occurred.' });
    } finally {
        setSendingMessage(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
        (((user.userName || user.name) && (user.userName || user.name).toLowerCase().includes(searchTerm.toLowerCase())) || 
         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (filterRegion === 'all' || user.region === filterRegion) &&
        (filterUserType === 'all' || user.userType === filterUserType)
    );
  }, [users, searchTerm, filterRegion, filterUserType]);

  if (loading) {
    return <Container className="text-center mt-5"><Spinner animation="border" variant="success" /><p>Loading user data...</p></Container>;
  }

  return (
    <Container fluid>
      <h2 className="mb-3">User Activity & Communication</h2>
      <p className="text-muted">Oversee user engagement and communicate with users.</p>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Header>
          <Row className="g-2 align-items-center">
            <Col md={4} sm={12}><InputGroup size="sm"><InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text><Form.Control placeholder="Search name/email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></InputGroup></Col>
            <Col md={3} sm={6}><Form.Select size="sm" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>{regions.map(r => <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>)}</Form.Select></Col>
            <Col md={3} sm={6}><Form.Select size="sm" value={filterUserType} onChange={e => setFilterUserType(e.target.value)}>{userTypes.map(type => <option key={type} value={type}>{type === 'all' ? 'All User Types' : type.charAt(0).toUpperCase() + type.slice(1)}</option>)}</Form.Select></Col>
          </Row>
        </Card.Header>
        <Card.Body>
            {filteredUsers.length > 0 ? (
                <Table responsive striped bordered hover size="sm" className="align-middle">
                    <thead><tr><th>User Name</th><th>Email</th><th>Type</th><th>Crop Plans</th><th>Active Listings</th><th className="text-center">Actions</th></tr></thead>
                    <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id}> {/* Use user._id from MongoDB */}
                        <td>{user.userName || user.name}</td> {/* Display userName or name */}
                        <td>{user.email}</td>
                        <td>{user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1)}</td>
                        <td>{user.userType === 'Farmer' ? user.cropPlansCount : 'N/A'}</td>
                        <td>{user.userType === 'Farmer' ? user.productListingsCount : 'N/A'}</td> {/* Display product listings count */}
                        <td className="text-center">
                            <Button variant="outline-primary" size="sm" className="py-0 px-1" onClick={() => handleShowSendMessageModal(user)} title="Send Message" disabled={sendingMessage}>
                                <i className="bi bi-envelope-plus-fill me-1"></i> Message
                            </Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            ) : (
                <Alert variant="info" className="text-center">
                    {loading ? 'Fetching users...' : 'No users match your current filters.'}
                </Alert>
            )}
        </Card.Body>
      </Card>

      {selectedUser && (
        <Modal show={showSendMessageModal} onHide={() => setShowSendMessageModal(false)} size="lg" backdrop="static" keyboard={false}>
          <Modal.Header closeButton><Modal.Title>Send Message to {selectedUser.userName || selectedUser.name}</Modal.Title></Modal.Header>
          <Form noValidate validated={messageValidated} onSubmit={handleSendMessage}>
            <Modal.Body>
                {messageSendStatus.msg && <Alert variant={messageSendStatus.type}>{messageSendStatus.msg}</Alert>}
                <p className="mb-2"><strong>To:</strong> {selectedUser.userName || selectedUser.name} ({selectedUser.email})</p><hr/>
              <Form.Group className="mb-3"><Form.Label>Subject <span className="text-danger">*</span></Form.Label><Form.Control type="text" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} required placeholder="Message subject"/></Form.Group>
              <Form.Group><Form.Label>Message Body <span className="text-danger">*</span></Form.Label><Form.Control as="textarea" rows={7} value={messageBody} onChange={e => setMessageBody(e.target.value)} required placeholder="Compose your message..."/></Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowSendMessageModal(false)} disabled={sendingMessage}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={sendingMessage}>
                    {sendingMessage ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Sending...</> : 'Send Message'}
                </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Container>
  );
};

export default FarmActivitySupervisionPage;