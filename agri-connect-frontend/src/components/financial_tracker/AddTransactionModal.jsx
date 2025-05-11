import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const AddTransactionModal = ({ show, onHide, onAddTransaction }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense'); // 'income' or 'expense'
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [category, setCategory] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount || !date) {
            alert("Please fill in all required fields (Description, Amount, Date).");
            return;
        }
        onAddTransaction({ description, amount: parseFloat(amount), type, date, category });
        // Reset form
        setDescription('');
        setAmount('');
        setType('expense');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory('');
        onHide(); // Close modal
    };

    const incomeCategories = ["Crop Sales", "Livestock Sales", "Subsidies", "Other Income"];
    const expenseCategories = ["Inputs (Seeds, Fertilizer, Pesticides)", "Labor", "Fuel & Machinery", "Repairs & Maintenance", "Rent/Lease", "Utilities", "Loan Repayments", "Other Expenses"];

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className={`bi ${type === 'income' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'} me-2`}></i>
                    Record New Transaction
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="transactionType">
                                <Form.Label>Transaction Type</Form.Label>
                                <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="transactionDate">
                                <Form.Label>Date</Form.Label>
                                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="transactionDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., Sale of wheat, Purchase of fertilizer"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                     <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="transactionAmount">
                                <Form.Label>Amount (PKR)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    step="0.01"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="transactionCategory">
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select a category...</option>
                                    <optgroup label={type === 'income' ? "Income Categories" : "Expense Categories"}>
                                        {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </optgroup>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-grid">
                        <Button variant={type === 'income' ? 'success' : 'danger'} type="submit">
                            Add {type === 'income' ? 'Income' : 'Expense'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddTransactionModal;