import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    available: 1,
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/menu?all=true');
      if (res.data.success) {
        setMenu(res.data.menu);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }));
  };

  const openAddForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      available: 1,
    });
    setShowAddForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || '',
      available: item.available ? 1 : 0,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    try {
      if (editingItem) {
        // Edit food item
        const res = await api.put(`/api/menu/${editingItem.id}`, formData);
        if (res.data.success) {
          setMsg(`Menu item "${formData.name}" updated successfully in MySQL!`);
          setShowAddForm(false);
          fetchMenu();
        }
      } else {
        // Add new food item
        const res = await api.post('/api/menu', formData);
        if (res.data.success) {
          setMsg(`New item "${formData.name}" added to MySQL menu table!`);
          setShowAddForm(false);
          fetchMenu();
        }
      }
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      const newAvail = item.available === 1 ? 0 : 1;
      const res = await api.put(`/api/menu/${item.id}`, { available: newAvail });
      if (res.data.success) {
        setMenu((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, available: newAvail } : m))
        );
        setMsg(`Item "${item.name}" is now ${newAvail === 1 ? 'Available' : 'Disabled'}.`);
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from MySQL menu table?`)) {
      return;
    }

    try {
      const res = await api.delete(`/api/menu/${item.id}`);
      if (res.data.success) {
        setMsg(res.data.message || `Deleted "${item.name}" successfully!`);
        fetchMenu();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item from database.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Menu Management (Admin)</h1>
          
        </div>
        <div className="d-flex gap-2">
          <button onClick={openAddForm} className="btn btn-coffee btn-sm rounded-pill px-3 shadow-sm">
            <i className="bi bi-plus-circle me-1"></i> Add Food Item
          </button>
        </div>
      </div>

      {msg && (
        <div className="alert alert-success py-2 d-flex align-items-center gap-2 mb-4 rounded-3 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{msg}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 d-flex align-items-center gap-2 mb-4 rounded-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Add / Edit Form Card */}
      {showAddForm && (
        <div className="card card-beancraft border-0 p-4 mb-4 bg-light border">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-coffee-dark mb-0">
              <i className="bi bi-pencil-square me-2 text-coffee-accent"></i>
              {editingItem ? `Edit Menu Item #${editingItem.id}` : 'Add New Food Item'}
            </h4>
            <button onClick={() => setShowAddForm(false)} className="btn btn-sm btn-outline-secondary rounded-circle">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-coffee-dark">Food Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Hazelnut Frappe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-coffee-dark">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  className="form-control"
                  placeholder="e.g. 199.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-coffee-dark">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  className="form-control"
                  placeholder="Short description of ingredients and taste..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12 col-md-8">
                <label className="form-label small fw-semibold text-coffee-dark">Image URL (Unsplash or direct URL)</label>
                <input
                  type="url"
                  name="image"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12 col-md-4 d-flex align-items-end">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="availableSwitch"
                    name="available"
                    checked={formData.available === 1}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label small fw-semibold" htmlFor="availableSwitch">
                    Available for Ordering
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-outline-secondary rounded-pill px-4"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-coffee rounded-pill px-4 shadow-sm">
                <i className="bi bi-save me-1"></i> {editingItem ? 'Save Changes' : 'Insert Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-coffee mb-2" role="status"></div>
          <div>Loading menu records from MySQL...</div>
        </div>
      ) : (
        <div className="card card-beancraft border-0 p-3 p-md-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Item Details</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menu.map((item) => (
                  <tr key={item.id} className={item.available === 0 ? 'opacity-75 bg-light' : ''}>
                    <td className="fw-bold text-coffee-dark">#{item.id}</td>
                    <td>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="rounded-3 shadow-sm"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-coffee-dark">{item.name}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '280px' }}>
                        {item.description || 'No description provided.'}
                      </div>
                    </td>
                    <td className="fw-bold text-coffee-accent">
                      ₹{Number(item.price).toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailable(item)}
                        className={`btn btn-sm ${item.available === 1 ? 'btn-success' : 'btn-secondary'} rounded-pill px-2 py-0`}
                        title="Click to toggle availability"
                      >
                        {item.available === 1 ? 'Available' : 'Disabled'}
                      </button>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          onClick={() => openEditForm(item)}
                          className="btn btn-sm btn-outline-primary rounded-pill px-2"
                          title="Edit Item"
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn btn-sm btn-outline-danger rounded-pill px-2"
                          title="Delete Item"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
