import React from 'react';
import { Card, ListGroup, Badge, Alert } from 'react-bootstrap';

const FieldAllocationMap = ({ fields = [] }) => {
    if (fields.length === 0) {
        return <Alert variant="info">No fields allocated yet. Plan a crop to see field allocations.</Alert>;
    }
    return (
        <ListGroup>
            {fields.map(field => (
                <ListGroup.Item key={field.id} className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>{field.name}</strong> ({field.area})
                        {field.crop && <small className="d-block text-muted">Crop: {field.crop}</small>}
                    </div>
                    <Badge bg={field.status === 'Fallow' ? 'secondary' : (field.crop ? 'success' : 'warning') } pill>
                        {field.status}
                    </Badge>
                </ListGroup.Item>
            ))}
        </ListGroup>
        // For a visual map, you'd integrate a map library here
        // <div style={{ height: '300px', background: '#e9ecef', textAlign: 'center', paddingTop: '100px'}}>
        //     [Visual Field Map Placeholder]
        // </div>
    );
};

export default FieldAllocationMap;