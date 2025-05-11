import React from 'react';
import { ListGroup, Badge, Button, Dropdown, Alert } from 'react-bootstrap';

const TaskScheduler = ({ tasks = [], onUpdateTaskStatus }) => {
    if (tasks.length === 0) {
        return <Alert variant="info">No tasks scheduled. Use "Schedule Field Operation" to add tasks.</Alert>;
    }

    const getPriorityBadge = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'secondary';
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'danger'; // You might need logic to determine 'overdue'
            default: return 'secondary';
        }
    };

    return (
        <ListGroup>
            {tasks.map(task => (
                <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0">{task.description}</h6>
                        <small className="text-muted">
                            Field: {task.fieldId || 'N/A'} | Due: {task.dueDate || 'N/A'} | Priority: {' '}
                            <Badge pill bg={getPriorityBadge(task.priority)} className="me-1">
                                {task.priority}
                            </Badge>
                        </small>
                    </div>
                    <div>
                        <Badge bg={getStatusBadge(task.status)} className="me-2">{task.status}</Badge>
                        {task.status?.toLowerCase() !== 'completed' && (
                            <Dropdown size="sm" onSelect={(eventKey) => onUpdateTaskStatus(task.id, eventKey)}>
                                <Dropdown.Toggle variant="outline-secondary" id={`dropdown-task-${task.id}`}>
                                    Actions
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey="Completed">Mark as Completed</Dropdown.Item>
                                    <Dropdown.Item eventKey="Pending">Mark as Pending</Dropdown.Item>
                                    {/* Add more actions like Edit, Delete */}
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default TaskScheduler;