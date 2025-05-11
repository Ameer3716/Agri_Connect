import React from 'react';
import { Form, Button } from 'react-bootstrap';

const InputUsageForm = ({ fields = [], onSubmit }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        onSubmit(data);
        event.target.reset(); // Reset form after submission
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="inputUsageField">
                <Form.Label>Select Field</Form.Label>
                <Form.Select name="fieldId" required>
                    <option value="">Choose a field...</option>
                    {fields.filter(f => f.crop).map(field => ( // Only show fields with crops
                        <option key={field.id} value={field.id}>{field.name} ({field.crop})</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="inputUsageName">
                <Form.Label>Input Name</Form.Label>
                <Form.Control type="text" name="inputName" placeholder="e.g., Urea, Pesticide X" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="inputUsageQuantity">
                <Form.Label>Quantity Used</Form.Label>
                <Form.Control type="text" name="quantity" placeholder="e.g., 2 bags, 500ml" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="inputUsageUnit">
                <Form.Label>Unit</Form.Label>
                <Form.Control type="text" name="unit" placeholder="e.g., kg, Liters, bags" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="inputUsageDate">
                <Form.Label>Date of Application</Form.Label>
                <Form.Control type="date" name="applicationDate" required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="inputUsageNotes">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control as="textarea" name="notes" rows={2} />
            </Form.Group>

            <Button variant="info" type="submit" className="w-100">
                Record Usage
            </Button>
        </Form>
    );
};

export default InputUsageForm;