import React from 'react';
import { Card, Button } from 'react-bootstrap';

const DashboardCard = ({ title, iconClass, children, actionText, onActionClick, cardColor = 'light' }) => {
  return (
    <Card className={`shadow-sm mb-4 dashboard-card bg-${cardColor} text-${cardColor === 'light' ? 'dark' : 'white'}`}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          {iconClass && <i className={`${iconClass} card-icon me-3`} style={{ color: cardColor === 'light' ? 'var(--agri-primary-green)' : 'white' }}></i>}
          <Card.Title as="h5" className="mb-0 flex-grow-1">{title}</Card.Title>
        </div>
        <div className="flex-grow-1">
          {children}
        </div>
        {actionText && onActionClick && (
          <Button
            variant={cardColor === 'light' ? 'outline-success' : 'light'}
            size="sm"
            onClick={onActionClick}
            className="mt-3 align-self-start" // Align button to the start
          >
            {actionText} <i className="bi bi-arrow-right-short"></i>
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default DashboardCard;