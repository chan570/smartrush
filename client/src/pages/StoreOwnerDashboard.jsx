import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Package, Plus, TrendingUp, Edit2, X, 
  Search, Filter, MoreHorizontal, LayoutDashboard,
  Box, AlertCircle, ArrowUpRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';
import './Modals.css';

const StoreOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [store, setStore] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showUpdateStock, setShowUpdateStock] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  // Form state
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stockLevel: '', image: '' });
  const [newStockLevel, setNewStockLevel] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storeRes = await api.get('/api/stores/my-store');
        setStore(storeRes.data);
        
        const invRes = await api.get('/api/stores/my-store/inventory');
        setInventory(invRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/stores/my-store/products', newProduct);
      setInventory([...inventory, res.data]);
      setShowAddProduct(false);
      setNewProduct({ name: '', category: '', price: '', stockLevel: '', image: '' });
    } catch (error) {
      alert('Failed to add product');
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/stores/my-store/inventory/${selectedInventory._id}`, {
        stockLevel: Number(newStockLevel)
      });
      
      setInventory(inventory.map(item => item._id === res.data._id ? res.data : item));
      setShowUpdateStock(false);
      setSelectedInventory(null);
    } catch (error) {
      alert('Failed to update stock');
    }
  };

  if (loading) return (
    <div className="loading-screen-premium">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Loader2 size={40} color="var(--primary)" />
      </motion.div>
    </div>
  );

  if (!store) return (
    <div className="dashboard-container-premium">
      <div className="setup-notice glass-card animate-fade-in">
        <AlertCircle size={48} color="var(--primary)" />
        <h1>Store Not Found</h1>
        <p>Your account is not linked to any active store. Please contact support.</p>
        <button onClick={logout} className="secondary-btn"><LogOut size={16} /> Logout</button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout-premium">
      {/* Sidebar Navigation */}
      <aside className="sidebar-premium glass-sidebar">
        <div className="sidebar-header">
          <div className="logo-box">SR</div>
          <span className="brand-name">SmartRush</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active"><LayoutDashboard size={20} /> Dashboard</div>
          <div className="nav-item"><Box size={20} /> Inventory</div>
          <div className="nav-item"><TrendingUp size={20} /> Analytics</div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-mini">
             <div className="avatar-box">{user.name[0]}</div>
             <div className="user-info">
               <p className="user-name">{user.name}</p>
               <p className="user-role">Store Owner</p>
             </div>
          </div>
          <button onClick={logout} className="logout-btn-premium"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content-premium">
        <header className="content-header-premium">
          <div className="header-text">
            <h1 className="premium-gradient-text">{store.name}</h1>
            <p>Managing your inventory across the platform.</p>
          </div>
          <div className="header-actions">
            <div className="search-bar-premium glass-card">
              <Search size={18} />
              <input type="text" placeholder="Search products..." />
            </div>
            <button className="primary-btn" onClick={() => setShowAddProduct(true)}>
              <Plus size={18} /> Add Product
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid-premium">
          <motion.div className="stat-card-premium glass-card" whileHover={{ y: -5 }}>
            <div className="stat-header">
              <div className="stat-icon-box blue"><TrendingUp size={20} /></div>
              <span className="stat-trend up">+12% <ArrowUpRight size={12} /></span>
            </div>
            <p className="stat-label">Total Products</p>
            <h2 className="stat-value">{inventory.length}</h2>
          </motion.div>

          <motion.div className="stat-card-premium glass-card" whileHover={{ y: -5 }}>
            <div className="stat-header">
              <div className="stat-icon-box pink"><Package size={20} /></div>
            </div>
            <p className="stat-label">Stock Units</p>
            <h2 className="stat-value">{inventory.reduce((acc, curr) => acc + curr.stockLevel, 0)}</h2>
          </motion.div>

          <motion.div className="stat-card-premium glass-card" whileHover={{ y: -5 }}>
            <div className="stat-header">
              <div className="stat-icon-box orange"><AlertCircle size={20} /></div>
              {inventory.filter(i => i.stockLevel < 10).length > 0 && <span className="stat-alert-dot" />}
            </div>
            <p className="stat-label">Low Stock Alerts</p>
            <h2 className="stat-value">{inventory.filter(i => i.stockLevel < 10).length}</h2>
          </motion.div>
        </section>

        {/* Inventory Section */}
        <section className="inventory-section-premium glass-card">
          <div className="section-header">
            <h3>Inventory Overview</h3>
            <div className="section-actions">
              <button className="filter-btn"><Filter size={16} /> Filters</button>
            </div>
          </div>

          <table className="premium-table">
            <thead>
              <tr>
                <th>Product Information</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => (
                <motion.tr 
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td>
                    <div className="table-product-cell">
                      <img src={item.product.image} alt="" className="table-img" />
                      <div className="table-name-box">
                        <p className="p-name">{item.product.name}</p>
                        <p className="p-id">ID: {item._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="table-category-badge">{item.product.category}</span></td>
                  <td><span className="table-price">₹{item.product.price}</span></td>
                  <td>
                    <div className="table-stock-box">
                      <div className="stock-progress-bg">
                        <div 
                          className={`stock-progress-fill ${item.stockLevel < 10 ? 'low' : ''}`} 
                          style={{ width: `${Math.min(item.stockLevel * 2, 100)}%` }} 
                        />
                      </div>
                      <span>{item.stockLevel} units</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn-premium" onClick={() => {
                        setSelectedInventory(item);
                        setNewStockLevel(item.stockLevel);
                        setShowUpdateStock(true);
                      }}><Edit2 size={16} /></button>
                      <button className="icon-btn-premium"><MoreHorizontal size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="modal-overlay-premium" onClick={() => setShowAddProduct(false)}>
            <motion.div 
              className="modal-content-premium glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-premium-box">
                <h3>Add New Inventory</h3>
                <button onClick={() => setShowAddProduct(false)} className="close-modal-btn"><X /></button>
              </div>
              <form onSubmit={handleAddProduct} className="premium-form">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" placeholder="e.g. Classic White Sneakers" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required className="form-input" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" placeholder="Footwear" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" placeholder="1299" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Initial Stock Level</label>
                  <input type="number" placeholder="50" value={newProduct.stockLevel} onChange={e => setNewProduct({...newProduct, stockLevel: e.target.value})} required className="form-input" />
                </div>
                <div className="form-group">
                  <label>Image URL (Optional)</label>
                  <input type="text" placeholder="https://unsplash.com/..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="form-input" />
                </div>
                <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '12px' }}>Confirm & Add Product</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update Stock Modal */}
      <AnimatePresence>
        {showUpdateStock && (
          <div className="modal-overlay-premium" onClick={() => setShowUpdateStock(false)}>
            <motion.div 
              className="modal-content-premium glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '400px' }}
            >
              <div className="modal-header-premium-box">
                <h3>Update Stock Level</h3>
                <button onClick={() => setShowUpdateStock(false)} className="close-modal-btn"><X /></button>
              </div>
              <div className="selected-item-preview">
                 <img src={selectedInventory.product.image} alt="" />
                 <div>
                   <p className="p-name">{selectedInventory.product.name}</p>
                   <p className="p-category">{selectedInventory.product.category}</p>
                 </div>
              </div>
              <form onSubmit={handleUpdateStock} className="premium-form">
                <div className="form-group">
                  <label>Current Stock: {selectedInventory.stockLevel}</label>
                  <input type="number" placeholder="New Quantity" value={newStockLevel} onChange={e => setNewStockLevel(e.target.value)} required className="form-input" />
                </div>
                <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '12px' }}>Update Stock</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .dashboard-layout-premium {
          display: flex;
          height: 100vh;
          background: #020617;
          overflow: hidden;
        }

        .sidebar-premium {
          width: 260px;
          display: flex;
          flex-direction: column;
          padding: 32px 16px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 48px;
          padding: 0 12px;
        }

        .logo-box {
          width: 32px;
          height: 32px;
          background: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-muted);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .nav-item:hover {
          background: var(--glass);
          color: white;
        }

        .nav-item.active {
          background: rgba(255, 63, 108, 0.1);
          color: var(--primary);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user-profile-mini {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--glass);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--primary);
          border: 1px solid var(--border);
        }

        .user-name { font-size: 14px; font-weight: 600; }
        .user-role { font-size: 12px; color: var(--text-muted); }

        .logout-btn-premium {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.3s;
        }

        .logout-btn-premium:hover { color: var(--primary); }

        .main-content-premium {
          flex: 1;
          padding: 40px 48px;
          overflow-y: auto;
        }

        .content-header-premium {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .header-actions {
          display: flex;
          gap: 16px;
        }

        .search-bar-premium {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          width: 300px;
          background: rgba(15, 23, 42, 0.4) !important;
        }

        .search-bar-premium input {
          background: none;
          border: none;
          color: white;
          width: 100%;
          outline: none;
          font-size: 14px;
          height: 44px;
        }

        .stats-grid-premium {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card-premium {
          padding: 24px;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .stat-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-box.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .stat-icon-box.pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
        .stat-icon-box.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }

        .stat-trend { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .stat-trend.up { color: #10b981; }

        .stat-label { font-size: 14px; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
        .stat-value { font-size: 32px; font-weight: 800; }

        .inventory-section-premium {
          padding: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h3 { font-size: 20px; font-weight: 700; }

        .filter-btn {
          background: var(--glass);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .premium-table {
          width: 100%;
          border-collapse: collapse;
        }

        .premium-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }

        .premium-table td {
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
        }

        .table-product-cell { display: flex; gap: 16px; align-items: center; }
        .table-img { width: 44px; height: 54px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border); }
        .p-name { font-weight: 600; font-size: 15px; }
        .p-id { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        .table-category-badge {
          background: var(--glass);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid var(--border);
        }

        .table-price { font-weight: 700; font-size: 15px; }

        .table-stock-box { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 600; min-width: 120px; }
        .stock-progress-bg { width: 100%; height: 6px; background: var(--glass); border-radius: 10px; overflow: hidden; }
        .stock-progress-fill { height: 100%; background: #10b981; border-radius: 10px; }
        .stock-progress-fill.low { background: #ef4444; }

        .table-actions { display: flex; gap: 10px; }
        .icon-btn-premium {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--glass);
          border: 1px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .icon-btn-premium:hover { color: var(--primary); border-color: var(--primary); }

        /* Modals */
        .modal-overlay-premium {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3000;
          padding: 20px;
        }

        .modal-content-premium {
          width: 100%;
          max-width: 500px;
          padding: 32px;
        }

        .modal-header-premium-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .close-modal-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .premium-form { display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 700; color: var(--text-muted); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .selected-item-preview {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--glass);
          border-radius: 16px;
          margin-bottom: 24px;
          border: 1px solid var(--border);
        }

        .selected-item-preview img { width: 50px; height: 60px; border-radius: 8px; object-fit: cover; }
        .p-category { font-size: 12px; color: var(--primary); font-weight: 700; text-transform: uppercase; }

        .Loader2 { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};


export default StoreOwnerDashboard;
