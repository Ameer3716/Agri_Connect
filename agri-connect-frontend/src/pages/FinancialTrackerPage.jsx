import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardCard from '../components/common/DashboardCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF69B4', '#D0ED57', '#A4DE6C', '#8DD1E1'];

const FinancialTrackerPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netProfit: 0, expenseBreakdown: [] });
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({
    date: new Date().toISOString().split('T')[0], type: 'Expense', description: '', category: '', amount: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      // Fetch transactions
      const transResponse = await fetch(`${API_BASE_URL}/farmer/financials/transactions`, { headers, credentials: 'include' });
      if (!transResponse.ok) throw new Error((await transResponse.json()).message || 'Failed to fetch transactions');
      const transData = await transResponse.json();
      setTransactions(transData);

      // Fetch summary
      const summaryResponse = await fetch(`${API_BASE_URL}/farmer/financials/summary`, { headers, credentials: 'include' });
      if (!summaryResponse.ok) throw new Error((await summaryResponse.json()).message || 'Failed to fetch financial summary');
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('action') === 'add_expense') {
      setCurrentTransaction({ date: new Date().toISOString().split('T')[0], type: 'Expense', description: '', category: '', amount: '' });
      setShowModal(true);
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleShowModal = () => {
    setCurrentTransaction({ date: new Date().toISOString().split('T')[0], type: 'Expense', description: '', category: '', amount: '' });
    setValidated(false);
    setSubmitError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (new URLSearchParams(location.search).get('action') === 'add_expense') {
      navigate('/financials', { replace: true });
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
    setLoading(true); // Indicate loading
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const response = await fetch(`${API_BASE_URL}/farmer/financials/transactions`, {
        method: 'POST', headers, body: JSON.stringify(currentTransaction), credentials: 'include',
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to add transaction');
      await fetchData(); // Re-fetch all data
      handleCloseModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
        setLoading(false); // Stop loading indicator
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setLoading(true);
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      try {
        const response = await fetch(`${API_BASE_URL}/farmer/financials/transactions/${id}`, {
          method: 'DELETE', headers, credentials: 'include',
        });
        if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete transaction');
        await fetchData(); // Re-fetch all data
      } catch (err) {
        setError(err.message); // Show general error for delete
      } finally {
          setLoading(false);
      }
    }
  };
  
  // For Pie Chart Label
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    if (percent < 0.03) return null; // Don't render label for very small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + (radius + 15) * Math.cos(-midAngle * RADIAN); // Adjust radius + 15 for label position
    const y = cy + (radius + 15) * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
        </text>
    );
  };


  if (loading && transactions.length === 0 && summary.expenseBreakdown.length === 0) {
    return <Container className="text-center mt-5"><Spinner animation="border" variant="success" /><p>Loading financial data...</p></Container>;
  }

  return (
    <Container fluid>
      <Row className="mb-3 align-items-center">
        <Col md={8}><h2>Financial Tracker</h2><p className="text-muted">Monitor income, expenses, and profitability.</p></Col>
        <Col md={4} className="text-md-end">
          <Button variant="success" onClick={handleShowModal}><i className="bi bi-plus-circle-fill me-2"></i>Add Transaction</Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
            <DashboardCard title="Total Income" iconClass="bi bi-arrow-up-circle-fill text-success">
                <h4 className="text-success mb-0">PKR {summary.totalIncome.toLocaleString()}</h4>
            </DashboardCard>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
            <DashboardCard title="Total Expenses" iconClass="bi bi-arrow-down-circle-fill text-danger">
                <h4 className="text-danger mb-0">PKR {summary.totalExpenses.toLocaleString()}</h4>
            </DashboardCard>
        </Col>
        <Col md={4}>
            <DashboardCard title="Net Profit/Loss" iconClass="bi bi-calculator-fill text-primary">
                <h4 className={`${summary.netProfit >= 0 ? 'text-primary' : 'text-danger'} mb-0`}>
                    PKR {summary.netProfit.toLocaleString()}
                </h4>
            </DashboardCard>
        </Col>
      </Row>

      <Row>
        <Col md={7} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5">Transaction History</Card.Header>
             {loading && transactions.length === 0 ? <div className="text-center p-5"><Spinner animation="border" size="sm"/></div> :
              transactions.length > 0 ? (
                <Table responsive striped hover className="mb-0">
                    <thead>
                        <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th className="text-end">Amount</th><th className="text-center">Actions</th></tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => ( // Already sorted by backend
                            <tr key={t._id}>
                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                <td>{t.description}</td>
                                <td>{t.category || '-'}</td>
                                <td className="text-center">
                                    <Badge pill bg={t.type === 'Income' ? 'success-subtle' : 'danger-subtle'} text={t.type === 'Income' ? 'success' : 'danger'} className="border border-1" style={{borderColor: t.type === 'Income' ? 'var(--bs-success)' : 'var(--bs-danger)' }}>{t.type}</Badge>
                                </td>
                                <td className={`text-end fw-medium ${t.type === 'Income' ? 'text-success' : 'text-danger'}`}>{t.amount.toLocaleString()}</td>
                                <td className="text-center">
                                    <Button variant="outline-danger" size="sm" className="py-0 px-1" onClick={() => handleDeleteTransaction(t._id)} title="Delete" disabled={loading}><i className="bi bi-trash"></i></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
             ) : (
                <Card.Body className="text-center text-muted py-5">No transactions recorded.</Card.Body>
             )}
          </Card>
        </Col>
        <Col md={5} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5">Expense Breakdown</Card.Header>
            <Card.Body style={{ minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading && summary.expenseBreakdown.length === 0 ? <div className="text-center"><Spinner animation="border" size="sm"/></div> :
               summary.expenseBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={summary.expenseBreakdown} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                      fill="#8884d8" paddingAngle={2}
                      labelLine={false} label={renderCustomizedLabel}
                    >
                      {summary.expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `PKR ${value.toLocaleString()}`} />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted">No expense data for chart.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton><Modal.Title>Add New Transaction</Modal.Title></Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            <Form.Group className="mb-3" controlId="transactionDateModal">
              <Form.Label>Date <span className="text-danger">*</span></Form.Label>
              <Form.Control type="date" name="date" value={currentTransaction.date} onChange={handleInputChange} required />
              <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionTypeModal">
              <Form.Label>Type <span className="text-danger">*</span></Form.Label>
              <Form.Select name="type" value={currentTransaction.type} onChange={handleInputChange} required>
                <option value="Expense">Expense</option><option value="Income">Income</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionDescriptionModal">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="description" value={currentTransaction.description} onChange={handleInputChange} required placeholder="e.g., Seed Purchase"/>
              <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionCategoryModal">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" name="category" value={currentTransaction.category} onChange={handleInputChange} placeholder="e.g., Seeds, Sales"/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactionAmountModal">
              <Form.Label>Amount (PKR) <span className="text-danger">*</span></Form.Label>
              <Form.Control type="number" name="amount" value={currentTransaction.amount} onChange={handleInputChange} required min="0.01" step="0.01" placeholder="0.00"/>
              <Form.Control.Feedback type="invalid">Valid positive amount required.</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>Close</Button>
            <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/> : null}
                Add Transaction
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default FinancialTrackerPage;