import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/customers');
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Registered Customers</h1>
          
        </div>
        <button onClick={fetchCustomers} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-coffee mb-2" role="status"></div>
          <div>Loading customer records from MySQL...</div>
        </div>
      ) : customers.length === 0 ? (
        <div className="card card-beancraft border-0 p-5 text-center">
          <i className="bi bi-people fs-1 text-muted mb-2"></i>
          <h4 className="fw-bold text-coffee-dark">No customers found</h4>
          <p className="text-muted small">New customer accounts created via signup will appear here.</p>
        </div>
      ) : (
        <div className="card card-beancraft border-0 p-3 p-md-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Total Orders Placed</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-bold text-coffee-dark">USER#{c.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-light rounded-circle text-coffee p-2 text-center" style={{ width: '36px', height: '36px' }}>
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="fw-bold text-coffee-dark">{c.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{c.email}</td>
                    <td>
                      <span className={`badge ${Number(c.total_orders) > 0 ? 'bg-primary' : 'bg-secondary'} rounded-pill px-3 py-1 fs-6`}>
                        {c.total_orders} Orders
                      </span>
                    </td>
                    <td className="text-muted small">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-top d-flex justify-content-between text-muted small">
            <span>Total Customers: <strong>{customers.length}</strong></span>
            
          </div>
        </div>
      )}
    </div>
  );
}
