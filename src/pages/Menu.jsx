import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  const { addToCart, cart } = useAuth();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/menu');
      if (res.data.success) {
        setMenu(res.data.menu);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    setNotification(`Added "${item.name}" to cart!`);
    setTimeout(() => {
      setNotification('');
    }, 2500);
  };

  const filteredItems = menu.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-4">
      {/* Toast Notification */}
      {notification && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-coffee-dark border-0 shadow-lg rounded-3" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-warning fs-5"></i>
                <div>{notification}</div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setNotification('')}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Header and Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">BeanCraft Menu</h1>
          <p className="text-muted small mb-0">Handcrafted beverages and gourmet snacks prepared fresh upon order</p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search coffee, pizza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn btn-outline-secondary border-start-0 bg-white" onClick={() => setSearchTerm('')}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          <Link to="/cart" className="btn btn-coffee d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm">
            <i className="bi bi-cart3"></i>
            <span className="d-none d-sm-inline">Cart</span>
            <span className="badge bg-warning text-dark rounded-pill">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </Link>
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-coffee mb-2" role="status"></div>
          <div>Loading artisanal menu...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <i className="bi bi-cup-hot text-muted fs-1 mb-2 d-block"></i>
          <h5 className="text-coffee-dark">No food items found</h5>
          <p className="text-muted small">Try searching for something else or reset your search query.</p>
          <button onClick={() => setSearchTerm('')} className="btn btn-sm btn-outline-secondary">
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card card-beancraft h-100 border-0 overflow-hidden d-flex flex-column">
                <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 m-2">
                    <span className="badge bg-coffee-dark text-warning px-2 py-1 shadow-sm fw-bold">
                      ₹{Number(item.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="card-body p-3 d-flex flex-column flex-grow-1">
                  <h5 className="card-title fw-bold text-coffee-dark mb-1">{item.name}</h5>
                  <p className="card-text text-muted small flex-grow-1" style={{ fontSize: '0.85rem' }}>
                    {item.description || 'Deliciously prepared using fresh quality ingredients.'}
                  </p>

                  <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                    <span className="text-coffee-accent fw-bold fs-5">₹{Number(item.price).toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="btn btn-sm btn-coffee rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                    >
                      <i className="bi bi-plus-lg"></i>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
