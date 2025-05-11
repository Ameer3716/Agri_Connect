// src/pages/FarmerNotificationsPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Badge, Alert } from 'react-bootstrap';

// Dummy initial notifications
const initialFarmerNotifications = [
  { id: 1, type: 'Task Reminder', message: 'Irrigation for Wheat Field A is due tomorrow.', timestamp: '2024-07-30T10:00:00Z', read: false, link: '/tasks' },
  { id: 2, type: 'Market Alert', message: 'Cotton prices have increased by 2%. Check marketplace.', timestamp: '2024-07-29T14:30:00Z', read: true, link: '/marketplace' },
  { id: 3, type: 'System Info', message: 'New weather advisory available for your region.', timestamp: '2024-07-29T09:15:00Z', read: false, link: '#' },
  { id: 4, type: 'Crop Health', message: 'Potential pest risk detected for Sugarcane field.', timestamp: '2024-07-28T17:00:00Z', read: true, link: '/planning' },
];

const FarmerNotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialFarmerNotifications);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

   const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    if (window.confirm('Delete this notification?')) {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

   const getBadgeVariant = (type) => {
    switch (type) {
      case 'Task Reminder': return 'primary';
      case 'Market Alert': return 'success';
      case 'Crop Health': return 'warning';
      case 'System Info': return 'info';
      default: return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container fluid>
      <Row className="mb-3 align-items-center">
        <Col>
          <h2>Your Notifications</h2>
          <p className="text-muted">Stay updated with important alerts and reminders.</p>
        </Col>
         <Col xs="auto" className="text-end">
            {unreadCount > 0 &&
                <Button variant="outline-primary" size="sm" onClick={markAllAsRead}>
                    Mark All as Read ({unreadCount})
                </Button>
            }
        </Col>
      </Row>

      {notifications.length > 0 ? (
        <Card className="shadow-sm">
          <ListGroup variant="flush">
            {notifications.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(notification => (
              <ListGroup.Item key={notification.id} className={`d-flex justify-content-between align-items-start ${notification.read ? 'bg-light text-muted' : 'fw-semibold'}`}>
                <div>
                  <Badge bg={getBadgeVariant(notification.type)} className="me-2 mb-1">{notification.type}</Badge>
                  {notification.message}
                  <small className="d-block text-muted fst-italic">
                    {new Date(notification.timestamp).toLocaleString()}
                  </small>
                </div>
                <div className="ms-2 text-nowrap">
                  {!notification.read && (
                    <Button variant="link" size="sm" className="py-0 px-1 me-1" onClick={() => markAsRead(notification.id)} title="Mark as read">
                      <i className="bi bi-check2-square"></i>
                    </Button>
                  )}
                   {notification.link && notification.link !== '#' && (
                     <Button as="a" href={notification.link} variant="link" size="sm" className="py-0 px-1 me-1" title="View Details">
                        <i className="bi bi-box-arrow-up-right"></i>
                    </Button>
                   )}
                  <Button variant="link" size="sm" className="text-danger py-0 px-1" onClick={() => deleteNotification(notification.id)} title="Delete">
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      ) : (
        <Alert variant="info" className="text-center">You have no notifications at the moment.</Alert>
      )}
    </Container>
  );
};

export default FarmerNotificationsPage;