import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';

const TransactionList = ({ transactions = [], onDeleteTransaction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

    const formatCurrency = (amount) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const filteredTransactions = transactions
        .filter(tx => {
            const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  tx.category?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || tx.type === filterType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent

    return (
        <>
            <Row className="mb-3">
                <Col md={6}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                    </InputGroup>
                </Col>
                <Col md={6}>
                    <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expenses Only</option>
                    </Form.Select>
                </Col>
            </Row>
            <Table striped bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th className="text-end">Amount (PKR)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{new Date(tx.date).toLocaleDateString()}</td>
                            <td>{tx.description}</td>
                            <td>{tx.category || 'N/A'}</td>
                            <td>
                                <Badge bg={tx.type === 'income' ? 'success' : 'danger'}>
                                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                </Badge>
                            </td>
                            <td className={`text-end fw-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                {formatCurrency(tx.amount)}
                            </td>
                            <td>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => onDeleteTransaction(tx.id)}
                                    title="Delete Transaction"
                                >
                                    <i className="bi bi-trash3-fill"></i>
                                </Button>
                                {/* Add Edit button later if needed */}
                            </td>
                        </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center">No transactions match your filters.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </>
    );
};

export default TransactionList;