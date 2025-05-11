import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const FinancialSummaryCard = ({ totalIncome, totalExpenses, netProfit }) => {
    const formatCurrency = (amount) => `PKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <Card className="shadow-sm h-100 dashboard-card">
            <Card.Header as="h5" className="bg-primary text-white">
                <i className="bi bi-pie-chart-fill me-2"></i>Financial Summary
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <strong>Total Income:</strong>
                        <span className="text-success fw-bold">{formatCurrency(totalIncome)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <strong>Total Expenses:</strong>
                        <span className="text-danger fw-bold">{formatCurrency(totalExpenses)}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center fs-5">
                        <strong>Net Profit/Loss:</strong>
                        <span className={`fw-bold ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(netProfit)}
                        </span>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
            <Card.Footer className="text-muted small">
                Status as of today
            </Card.Footer>
        </Card>
    );
};

export default FinancialSummaryCard;