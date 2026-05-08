import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateDistance, estimateTravelTime } from '../utils/geoUtils';
import { Search, Clock, MapPin, Filter, Star, Navigation, ChevronDown, User, LogOut, ShoppingBag, GripVertical, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const PRESET_CITIES = [
  { name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
  { name: 'Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
];

const Sidebar = ({ stores, userLocation, urgency, setUrgency, onStoreSelect, discoveryStatus, onLocationChange, onUseMyLocation, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [currentCityName, setCurrentCityName] = useState('Detecting...');
  const [width, setWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();

  const startResizing = useCallback((e) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 300 && newWidth < 600) {
        setWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const brands = useMemo(() => {
    const b = new Set(stores.map(s => s.brand));
    return ['All', ...Array.from(b)];
  }, [stores]);

  const recommendedStores = useMemo(() => {
    if (!userLocation) return stores;

    return stores
      .map(store => {
        const storeLat = store.lat || (store.location && store.location.lat);
        const storeLng = store.lng || (store.location && store.location.lng);
        
        if (!storeLat || !storeLng) return { ...store, distance: 999, eta: 999, score: 999 };

        const dist = calculateDistance(
          userLocation.lat, userLocation.lng,
          storeLat, storeLng
        );
        const eta = estimateTravelTime(dist);
        
        // Calculate "Rush Score" (Lower is better)
        const score = eta + (dist * 2) - (store.rating * 2);
        
        return { ...store, distance: dist, eta, score };
      })
      .filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             store.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBrand = selectedBrand === 'All' || store.brand === selectedBrand;
        
        // Priority 0 stores (Seeded/Partners) are ALWAYS shown
        if (store.priority === 0) return matchesSearch && matchesBrand;

        const withinUrgency = store.eta <= urgency;
        return matchesSearch && matchesBrand && withinUrgency;
      })
      .sort((a, b) => {
        // Priority 0 stores (Database/Partner) always stay on top
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Then sort by score (ETA + Distance)
        return a.score - b.score;
      });
  }, [stores, userLocation, searchTerm, selectedBrand, urgency]);

  return (
    <>
      <aside 
        className={`glass-sidebar ${isOpen ? 'active' : ''}`} 
        style={{ width: window.innerWidth > 768 ? `${width}px` : '85vw', flex: 'none' }}
      >
        <div 
          className={`resize-handle ${isResizing ? 'active' : ''}`} 
          onMouseDown={startResizing}
        >
          <GripVertical size={14} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock style={{ color: 'var(--primary)' }} /> SmartRush
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Urgent shopping, solved.</p>
          </div>
          
          <button className="mobile-close-btn" onClick={onClose}>
            <CloseIcon size={24} />
          </button>
          
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>{user.name}</p>
                  <p style={{ fontSize: '10px', margin: 0, color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</p>
                </div>
                <button onClick={logout} className="secondary-btn" style={{ padding: '6px', borderRadius: '50%' }} title="Logout">
                  <LogOut size={14} />
                </button>
              </div>
              
              <button 
                onClick={() => navigate('/my-orders')} 
                className="primary-btn" 
                style={{ padding: '10px', fontSize: '12px', width: '100%' }}
              >
                <ShoppingBag size={14} /> View My Orders
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Search */}
          <div className="search-container">
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search brand or store..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Location Picker */}
          <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>Location</span>
              </div>
              <button
                onClick={() => setShowCityPicker(!showCityPicker)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {currentCityName} <ChevronDown style={{ width: '12px', height: '12px' }} />
              </button>
            </div>

            {showCityPicker && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <button
                  onClick={() => { onUseMyLocation(); setCurrentCityName('My Location'); setShowCityPicker(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', borderRadius: '6px', border: '1px dashed var(--primary)', background: 'var(--accent-glow)', color: 'var(--primary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <Navigation style={{ width: '12px', height: '12px' }} /> Use My Location
                </button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {PRESET_CITIES.map(city => (
                    <button
                      key={city.name}
                      onClick={() => { onLocationChange(city.lat, city.lng); setCurrentCityName(city.name); setShowCityPicker(false); }}
                      className={`brand-capsule ${currentCityName === city.name ? 'active' : ''}`}
                      style={{ fontSize: '10px', padding: '4px 10px' }}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Discovery status */}
            <div style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.15)', textAlign: 'center' }}>
              {discoveryStatus === 'searching' && <span style={{ color: 'var(--primary)' }}>🔍 Searching nearby brands...</span>}
              {discoveryStatus === 'success' && <span style={{ color: '#03a685' }}>✅ {stores.length} Stores in {currentCityName}</span>}
              {discoveryStatus === 'no_results' && <span style={{ color: '#ffcc00' }}>⚠️ No major brands found nearby.</span>}
              {discoveryStatus === 'error' && <span style={{ color: '#ff3f6c' }}>❌ Discovery issue, showing cached data</span>}
              {discoveryStatus === 'idle' && <span style={{ color: 'var(--text-muted)' }}>📍 Select a location above</span>}
            </div>
          </div>

          {/* Urgency Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="filter-label" style={{ marginBottom: 0 }}>Urgency (Max ETA)</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{urgency} mins</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="60" 
              step="5"
              value={urgency}
              onChange={(e) => setUrgency(parseInt(e.target.value))}
              className="urgency-slider"
            />
          </div>

          {/* Brand Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="filter-label">Top Brands</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`brand-capsule ${selectedBrand === brand ? 'active' : ''}`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Stores */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="filter-label" style={{ marginBottom: 0 }}>Recommended Stores</span>
              <div className="live-sync-indicator">
                <div className="sync-dot"></div>
                <span>Live Sync</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <AnimatePresence mode="popLayout">
                {recommendedStores.length > 0 ? (
                  recommendedStores.map((store, index) => (
                    <motion.div
                      key={store._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onStoreSelect(store)}
                      className="glass-card store-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)' }}>{store.name}</h3>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{store.brand}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <div className="store-rating">
                            <Star style={{ width: '10px', height: '10px', fill: 'currentColor' }} /> {store.rating}
                          </div>
                          {store.priority === 0 && (
                            <span className="partner-badge">Partner</span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                          <Clock style={{ width: '12px', height: '12px', color: 'var(--primary)' }} /> 
                          {(store.priority === 0 && store.distance > 50) ? 'SmartRush Delivery' : `${store.eta} mins`}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                          <MapPin style={{ width: '12px', height: '12px', color: 'var(--primary)' }} /> 
                          {(store.priority === 0 && store.distance > 50) ? 'Official Partner' : `${store.distance?.toFixed(1)} km`}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No stores found within {urgency} mins</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>
      <style>{`
        .resize-handle {
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 100%;
        cursor: col-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        opacity: 0;
        transition: all 0.3s;
        z-index: 100;
        background: linear-gradient(to right, transparent, var(--border));
      }

      .glass-sidebar:hover .resize-handle {
        opacity: 1;
      }

      .resize-handle.active {
        opacity: 1;
        width: 15px;
        background: var(--primary-glow);
        color: var(--primary);
      }

      .partner-badge {
        font-size: 8px;
        font-weight: 800;
        background: var(--primary);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .live-sync-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #03a685;
          text-transform: uppercase;
          opacity: 0.8;
        }

        .sync-dot {
          width: 6px;
          height: 6px;
          background: #03a685;
          border-radius: 50%;
          box-shadow: 0 0 10px #03a685;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }

        .mobile-close-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .mobile-close-btn {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
