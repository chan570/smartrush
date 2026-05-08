import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import InventoryModal from './components/InventoryModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import api from './utils/api';
import { BarChart3, Map as MapIcon, Sun, Moon, MapPin, Zap } from 'lucide-react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import MyOrders from './pages/MyOrders';

const MainApp = () => {
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [urgency, setUrgency] = useState(45);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [discoveryStatus, setDiscoveryStatus] = useState('idle');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchStores = async (customLat, customLng) => {
    const lat = customLat || userLocation?.lat;
    const lng = customLng || userLocation?.lng;
    if (!lat || !lng) return;

    try {
      // 1. Load Seeded Stores from DB
      const dbRes = await api.get('/api/stores');
      const dbStores = dbRes.data.map(s => ({ ...s, priority: 0 }));
      
      // 2. Discovery Real-time Stores from API
      setDiscoveryStatus('searching');
      try {
        const liveRes = await api.get(`/api/stores/discover?lat=${lat}&lng=${lng}`);
        const liveStores = liveRes.data;
        setStores([...dbStores, ...liveStores]);
        setDiscoveryStatus(liveStores.length > 0 ? 'success' : 'no_results');
      } catch (err) {
        console.error('Discovery failed:', err);
        setStores(dbStores);
        setDiscoveryStatus('error');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setLoading(false);
      setDiscoveryStatus('error');
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          fetchStores(lat, lng);
        },
        (error) => {
          console.error("Geolocation error:", error);
          const lat = 12.9352; // Fallback to Bengaluru
          const lng = 77.6245;
          setUserLocation({ lat, lng });
          fetchStores(lat, lng);
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchStores();
      const interval = setInterval(() => {
        fetchStores();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [userLocation?.lat, userLocation?.lng]);

  const setMockLocation = () => {
    const lat = 28.6139; // Delhi Mock
    const lng = 77.2090;
    setUserLocation({ lat, lng });
    fetchStores(lat, lng);
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
  };

  const handleLocationChange = (lat, lng) => {
    setUserLocation({ lat, lng });
    fetchStores(lat, lng);
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={`app-container ${theme}`}>
      <Sidebar 
        stores={stores} 
        userLocation={userLocation}
        urgency={urgency}
        setUrgency={setUrgency}
        onStoreSelect={(s) => { handleStoreSelect(s); setMobileSidebarOpen(false); }}
        discoveryStatus={discoveryStatus}
        onLocationChange={handleLocationChange}
        onUseMyLocation={getCurrentLocation}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      
      <main className="main-content">
        <div className="floating-actions">
          <button className="action-btn glass-card" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="action-btn glass-card" onClick={() => setShowAnalytics(true)}>
            <BarChart3 size={18} />
            <span>Insights</span>
          </button>
          <button className="action-btn glass-card" onClick={getCurrentLocation}>
            <MapPin size={18} />
            <span>Real Loc</span>
          </button>
          <button className="action-btn glass-card" onClick={setMockLocation} style={{ borderStyle: 'dashed' }}>
            <Zap size={18} />
            <span>Demo (Delhi)</span>
          </button>
        </div>

        <button 
          className="sidebar-mobile-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <MapIcon size={24} />
        </button>

        <MapView 
          stores={stores} 
          userLocation={userLocation}
          onStoreSelect={setSelectedStore}
          urgency={urgency}
        />
      </main>

      {selectedStore && (
        <InventoryModal 
          store={selectedStore} 
          onClose={() => setSelectedStore(null)} 
        />
      )}

      {showAnalytics && (
        <AnalyticsDashboard 
          onClose={() => setShowAnalytics(false)} 
        />
      )}
    </div>
  );
};

const RoleBasedRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'store_owner') return <StoreOwnerDashboard />;
  if (user.role === 'admin') return <div style={{ color: 'white', padding: '20px' }}>Admin Dashboard</div>;
  return <MainApp />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/" element={<RoleBasedRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
