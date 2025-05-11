import React from 'react';
import { Table, Badge } from 'react-bootstrap';

const MarketPriceTicker = ({ prices = [] }) => {
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return <i className="bi bi-arrow-up-right text-success ms-1"></i>;
            case 'down': return <i className="bi bi-arrow-down-right text-danger ms-1"></i>;
            case 'stable': return <i className="bi bi-arrow-right text-secondary ms-1"></i>;
            default: return null;
        }
    };

    if (prices.length === 0) {
        return <p className="text-muted">Market price data is currently unavailable.</p>;
    }

    return (
        <Table striped hover responsive size="sm" className="mb-0">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Unit</th>
                    <th className="text-end">Price (PKR)</th>
                    <th>Trend</th>
                    <th>Location/Market</th>
                </tr>
            </thead>
            <tbody>
                {prices.map(item => (
                    <tr key={item.id}>
                        <td>{item.product}</td>
                        <td>{item.unit}</td>
                        <td className="text-end fw-bold">{item.price.toLocaleString()}</td>
                        <td>{getTrendIcon(item.trend)}</td>
                        <td><small className="text-muted">{item.location}</small></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default MarketPriceTicker;