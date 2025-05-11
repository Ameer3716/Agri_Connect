import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';

const RecentTransactionsView = ({ transactions = [] }) => {
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'success';
            case 'in transit': return 'info';
            case 'payment pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    if (transactions.length === 0) {
        return <p className="text-muted">No recent transactions to display.</p>;
    }

    return (
        <ListGroup variant="flush">
            {transactions.map(tx => (
                <ListGroup.Item key={tx.id}>
                    <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{tx.product}</h6>
                        <small>{new Date(tx.date).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-1 small">
                        Buyer: {tx.buyer} | Seller: {tx.seller} | Qty: {tx.quantity}
                    </p>
                    <Badge bg={getStatusBadge(tx.status)}>{tx.status}</Badge>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default RecentTransactionsView;