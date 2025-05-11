import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, ListGroup, Badge, Button, Card, Spinner, Alert } from 'react-bootstrap';
import DashboardCard from '../components/common/DashboardCard'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';

// Define your API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FarmDashboard = () => {
  const navigate = useNavigate();
  console.log("FarmDashboard is rendering");

  // State for Active Crops
  const [activeCrops, setActiveCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [cropError, setCropError] = useState('');

  // Mock task data for fallback (just in case the API fails)
  const mockTasksData = [
    { _id: 'mock1', task: 'Irrigate Fields', description: 'Water all crops', due: new Date().toISOString(), priority: 'High', status: 'Pending' },
    { _id: 'mock2', task: 'Apply Fertilizer', description: 'Apply NPK fertilizer', due: new Date(Date.now() + 86400000).toISOString(), priority: 'Medium', status: 'Pending' },
    { _id: 'mock3', task: 'Harvest Wheat', description: 'Harvest field #3', due: new Date(Date.now() + 172800000).toISOString(), priority: 'High', status: 'Pending' }
  ];

  // State for Upcoming Tasks
  const [upcomingTasksData, setUpcomingTasksData] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState('');

  // State for Market Prices
  const [marketPricesData, setMarketPricesData] = useState([]);
  const [loadingMarketPrices, setLoadingMarketPrices] = useState(true);
  const [marketPriceError, setMarketPriceError] = useState('');

  // State for Financial Summary
  const [financialSummaryData, setFinancialSummaryData] = useState({
    totalIncome: 0, totalExpenses: 0, netProfit: 0, lastUpdated: null
  });
  const [loadingFinancials, setLoadingFinancials] = useState(true);
  const [financialError, setFinancialError] = useState('');


  const getAuthToken = () => localStorage.getItem('authToken');

  // Fetch crop plans for the dashboard summary
  const fetchDashboardCrops = useCallback(async () => {
    setLoadingCrops(true);
    setCropError('');
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/farmer/cropplans`, {
        method: 'GET', headers: headers, credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to fetch crop data: ${response.statusText}`);
      }
      const data = await response.json();
      const dashboardCropsData = data
        .filter(plan => plan.status !== 'Harvested' && plan.status !== 'Cancelled')
        .slice(0, 5)
        .map(plan => ({
            id: plan._id, name: plan.cropName, stage: plan.status, area: plan.area,
      }));
      setActiveCrops(dashboardCropsData);
    } catch (err) {
      console.error("Fetch dashboard crop error:", err);
      setCropError(err.message);
    } finally {
      setLoadingCrops(false);
    }
  }, []);
  // Fetch tasks for the dashboard summary
  const fetchDashboardTasks = useCallback(async () => {
    setLoadingTasks(true);
    setTaskError('');
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/farmer/tasks`, {
        method: 'GET', headers: headers, credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to fetch tasks: ${response.statusText}`);
      }      const data = await response.json();
      console.log("Dashboard Tasks Data:", data);
      
      // Check if data is valid and contains tasks
      if (!data || data.length === 0) {
        console.log("No tasks found, using mock data");
        setUpcomingTasksData(mockTasksData);
      } else {
        // Filter and sort tasks properly
        const pendingTasks = data
          .filter(task => task.status !== 'Completed' && task.status !== 'Cancelled')
          .sort((a, b) => new Date(a.due) - new Date(b.due))
          .slice(0, 4);
        
        setUpcomingTasksData(pendingTasks);
      }    } catch (err) {
      console.error("Fetch dashboard task error:", err);
      setTaskError(err.message);
      
      // Use mock data if API fails
      console.log("Using mock task data due to API error");
      setUpcomingTasksData(mockTasksData);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Fetch market prices for the dashboard summary
  const fetchDashboardMarketPrices = useCallback(async () => {
    setLoadingMarketPrices(true);
    setMarketPriceError('');
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/farmer/marketprices`, {
        method: 'GET', headers: headers, credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to fetch market prices: ${response.statusText}`);
      }
      const data = await response.json();
      const uniqueCrops = {};
      const recentPrices = data
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .filter(price => {
            if (!uniqueCrops[price.crop] && Object.keys(uniqueCrops).length < 4) {
                uniqueCrops[price.crop] = true;
                return true;
            }
            return false;
        });
      setMarketPricesData(recentPrices);
    } catch (err) {
      console.error("Fetch dashboard market price error:", err);
      setMarketPriceError(err.message);
    } finally {
      setLoadingMarketPrices(false);
    }
  }, []);

  // Fetch financial summary for the dashboard
  const fetchDashboardFinancialSummary = useCallback(async () => {
    setLoadingFinancials(true);
    setFinancialError('');
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/farmer/financials/summary`, {
        headers, credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to fetch financial summary: ${response.statusText}`);
      }
      const data = await response.json();
      setFinancialSummaryData(data);
    } catch (err) {
      console.error("Fetch financial summary error:", err);
      setFinancialError(err.message);
    } finally {
      setLoadingFinancials(false);
    }
  }, []);


  useEffect(() => {
    fetchDashboardCrops();
    fetchDashboardTasks();
    fetchDashboardMarketPrices();
    fetchDashboardFinancialSummary();
  }, [fetchDashboardCrops, fetchDashboardTasks, fetchDashboardMarketPrices, fetchDashboardFinancialSummary]);


  // --- Helper functions ---
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (/* trendData */) => {
    return <i className="bi bi-arrow-right-circle-fill text-secondary ms-2"></i>;
  };

  const getCropStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'planned': return 'info';
      case 'planted': return 'primary';
      case 'growing': return 'success';
      case 'flowering': return 'warning';
      case 'harvest ready': return 'danger';
      case 'harvested': return 'secondary';
      case 'cancelled': return 'dark';
      default: return 'light';
    }
  };

  const formatDueDateForDisplay = (dueDate) => {
    if (!dueDate) return 'N/A';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
    if (diffDays < 7) return `In ${diffDays} days`;
    return new Date(dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatPriceUpdate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString); const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
  };

  const formatSummaryDate = (dateString) => {
      if (!dateString) return 'Recent'; // Default if no date from summary
      return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Farm Dashboard</h2>
      <Row>
        {/* Active Crops Summary */}
        <Col md={6} lg={4} className="mb-4">
          <DashboardCard
            title="Active Crops Summary" iconClass="bi bi-flower1"
            actionText="Manage Crops" onActionClick={() => navigate('/planning')}
          >
            {loadingCrops ? (
              <div className="text-center py-3"><Spinner animation="border" size="sm" /> <span className="ms-2">Loading crops...</span></div>
            ) : cropError ? (
              <Alert variant="danger" className="m-2 py-2 px-3"><small>{cropError}</small></Alert>
            ) : activeCrops.length > 0 ? (
              <ListGroup variant="flush">
                {activeCrops.map(crop => (
                  <ListGroup.Item key={crop.id} className="d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                    <span><i className="bi bi-caret-right-fill me-2"></i>{crop.name} ({crop.area})</span>
                    <Badge bg={getCropStatusBadge(crop.stage)}>{crop.stage}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted text-center p-3 mb-0">No active crops.</p>
            )}
          </DashboardCard>
        </Col>

        {/* Upcoming Tasks */}
        <Col md={6} lg={4} className="mb-4">
          <DashboardCard
            title="Upcoming Tasks" iconClass="bi bi-calendar-check"
            actionText="View All Tasks" onActionClick={() => navigate('/tasks')}
          >
            {loadingTasks ? (
                <div className="text-center py-3"><Spinner animation="border" size="sm" /> <span className="ms-2">Loading tasks...</span></div>
            ) : taskError ? (
                <Alert variant="danger" className="m-2 py-2 px-3"><small>{taskError}</small></Alert>
            ) : upcomingTasksData.length > 0 ? (
                <ListGroup variant="flush">
                {upcomingTasksData.map(task => (
                    <ListGroup.Item key={task._id} className="d-flex justify-content-between align-items-start bg-transparent border-0 px-0">
                        <div>
                            <p className="mb-0 fw-bold">{task.task}</p>
                            <small className="text-muted">Due: {formatDueDateForDisplay(task.due)}</small>
                        </div>
                        <Badge pill bg={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                    </ListGroup.Item>
                ))}
                </ListGroup>
            ) : (
                <p className="text-muted text-center p-3 mb-0">No upcoming tasks.</p>
            )}
          </DashboardCard>
        </Col>

        {/* Market Price Indicators */}
        <Col md={6} lg={4} className="mb-4">
           <DashboardCard
            title="Market Price Indicators" iconClass="bi bi-graph-up-arrow"
            actionText="Manage Market Prices" onActionClick={() => navigate('/market-prices')}
          >
            {loadingMarketPrices ? (
                <div className="text-center py-3"><Spinner animation="border" size="sm" /> <span className="ms-2">Loading prices...</span></div>
            ) : marketPriceError ? (
                <Alert variant="danger" className="m-2 py-2 px-3"><small>{marketPriceError}</small></Alert>
            ) : marketPricesData.length > 0 ? (
                <ListGroup variant="flush">
                {marketPricesData.map(item => (
                    <ListGroup.Item key={item._id} className="d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                    <div>
                        <span className="fw-bold">{item.crop}</span>
                        <br/>
                        <small className="text-muted">{item.source || 'N/A'} ({formatPriceUpdate(item.updatedAt)})</small>
                    </div>
                    <span>PKR {parseFloat(item.price).toLocaleString()}/{item.unit} {getTrendIcon()}</span>
                    </ListGroup.Item>
                ))}
                </ListGroup>
            ) : (
                <p className="text-muted text-center p-3 mb-0">No market prices tracked.</p>
            )}
          </DashboardCard>
        </Col>

         {/* Financial Snapshot */}
        <Col md={6} lg={4} className="mb-4">
            <DashboardCard
              title="Financial Snapshot" iconClass="bi bi-cash-coin"
              actionText="View Financials" onActionClick={() => navigate('/financials')}
              cardColor="success"
            >
            {loadingFinancials ? (
                <div className="text-center py-3"><Spinner animation="border" size="sm"/> <span className="ms-2">Loading financials...</span></div>
            ) : financialError ? (
                <Alert variant="danger" className="m-2 py-2 px-3"><small>{financialError}</small></Alert>
            ) : (
                <>
                    <p className="mb-1"><strong>Total Income:</strong> PKR {financialSummaryData.totalIncome.toLocaleString()}</p>
                    <p className="mb-1"><strong>Total Expenses:</strong> PKR {financialSummaryData.totalExpenses.toLocaleString()}</p>
                    <p className={`mb-1 fs-5 fw-bold ${financialSummaryData.netProfit >= 0 ? 'text-white' : 'text-warning'}`}>
                        <strong>Est. Profit:</strong> PKR {financialSummaryData.netProfit.toLocaleString()}
                    </p>
                    <small className="text-white-50">
                        Last Updated: {formatSummaryDate(financialSummaryData.lastUpdated)}
                    </small>
                </>
            )}
            </DashboardCard>
        </Col>

         {/* Quick Actions Card (Navigation only) */}
         <Col md={6} lg={4} className="mb-4 d-flex">
             <Card className="shadow-sm mb-4 flex-fill">
                 <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                     <Card.Title>Quick Actions</Card.Title>
                     <Button variant="primary" className="mb-2 w-100" onClick={() => navigate('/tasks?action=add')}>
                         <i className="bi bi-plus-circle-fill me-2"></i>Add New Task
                     </Button>
                     <Button variant="info" className="mb-2 w-100" onClick={() => navigate('/financials?action=add_expense')}>
                         <i className="bi bi-receipt me-2"></i>Record Expense
                     </Button>
                     <Button variant="warning" className="w-100" onClick={() => navigate('/farmer-notifications')}>
                         <i className="bi bi-bell me-2"></i>Check Notifications
                     </Button>
                 </Card.Body>
             </Card>
         </Col>
      </Row>
    </Container>
  );
};

export default FarmDashboard;