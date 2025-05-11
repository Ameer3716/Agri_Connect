import React from 'react';
import { Table, Alert } from 'react-bootstrap';

const CropCalendarView = ({ plannedCrops = [] }) => {
    if (plannedCrops.length === 0) {
        return <Alert variant="info">No crops planned yet. Use the "Plan New Crop" button to get started.</Alert>;
    }

    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Field Name</th>
                    <th>Crop</th>
                    <th>Area</th>
                    <th>Sowing Date</th>
                    <th>Est. Harvest Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {plannedCrops.map((crop, index) => (
                    <tr key={crop.id || index}>
                        <td>{index + 1}</td>
                        <td>{crop.name}</td>
                        <td>{crop.crop}</td>
                        <td>{crop.area}</td>
                        <td>{crop.sowingDate || 'N/A'}</td>
                        <td>{crop.harvestDate || 'N/A'}</td>
                        <td><span className={`badge bg-${crop.status === 'Planted' || crop.status === 'Growing' ? 'success' : 'secondary'}`}>{crop.status}</span></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default CropCalendarView;