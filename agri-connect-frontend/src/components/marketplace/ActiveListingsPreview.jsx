import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // For linking to full listing later

const ActiveListingsPreview = ({ listings = [] }) => {
    if (listings.length === 0) {
        return <p className="text-muted">No active listings to display at the moment.</p>;
    }

    return (
        <ListGroup variant="flush">
            {listings.map(listing => (
                <ListGroup.Item key={listing.id} className="d-flex justify-content-between align-items-start flex-wrap">
                    <div className="me-auto">
                        <div className="fw-bold">
                            {/* <Link to={`/marketplace/listing/${listing.id}`} className="text-decoration-none"> */}
                                {listing.product}
                            {/* </Link> */}
                        </div>
                        <small className="text-muted">Seller: {listing.seller} | Qty: {listing.quantity}</small>
                    </div>
                    <div className="ms-2 mt-1 mt-sm-0 text-end">
                        <span className="d-block fw-semibold">{listing.price}</span>
                        <Badge bg="warning" text="dark" pill>Expires in: {listing.expires}</Badge>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default ActiveListingsPreview;