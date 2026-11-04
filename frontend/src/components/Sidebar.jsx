import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Search,
  RotateCcw,
  Footprints,
  Clock,
  Compass,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  HelpCircle,
  Route,
  Coffee,
  BookOpen,
  Home,
  Dumbbell
} from 'lucide-react';

export default function Sidebar({
  locations = [],
  startLocation = null,
  destLocation = null,
  setStartLocation = () => {},
  setDestLocation = () => {},
  onFindRoute = () => {},
  onFindAlternatives = () => {},
  onClearRoute = () => {},
  activeRoute = null,
  alternativeRoutes = [],
  selectedRouteIndex = 0,
  setSelectedRouteIndex = () => {},
  walkingSpeed = 1.2,
  setWalkingSpeed = () => {},
  categoryFilter = 'all',
  setCategoryFilter = () => {},
  nearbyData = null,
  onSelectNearbyFacility = () => {},
  loading = false,
  error = null,
}) {
  // Dropdown states
  const [startDropdownOpen, setStartDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [startSearchText, setStartSearchText] = useState('');
  const [destSearchText, setDestSearchText] = useState('');

  const startRef = useRef(null);
  const destRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (startRef.current && !startRef.current.contains(event.target)) {
        setStartDropdownOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setDestDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations for dropdown search
  const filteredStartLocations = locations.filter((loc) => {
    if (loc.isJunction) return false;
    const q = startSearchText.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.code.toLowerCase().includes(q) ||
      loc.category.toLowerCase().includes(q)
    );
  });

  const filteredDestLocations = locations.filter((loc) => {
    if (loc.isJunction) return false;
    const q = destSearchText.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.code.toLowerCase().includes(q) ||
      loc.category.toLowerCase().includes(q)
    );
  });

  const handleSwap = () => {
    const temp = startLocation;
    setStartLocation(destLocation);
    setDestLocation(temp);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins === 0) return `${secs} sec`;
    return `${mins} min ${secs > 0 ? `${secs}s` : ''}`;
  };

  // Test route presets from specification
  const testPresets = [
    { label: 'NC1 → D6 Library', start: 'NC1', dest: 'D6' },
    { label: 'NC4 → B1 Engineering', start: 'NC4', dest: 'B1' },
    { label: 'Zakir A → Sports Complex', start: 'ZAKIR_A', dest: 'SPORTS_COMPLEX' },
    { label: 'A1 → A3 Arts', start: 'A1', dest: 'A3' },
    { label: 'D6 → Student Centre', start: 'D6', dest: 'STUDENT_CENTRE' },
    { label: 'NC6 → B5 Law', start: 'NC6', dest: 'B5' },
    { label: 'B1 → Sports Ground', start: 'B1', dest: 'SPORTS_GROUND' },
    { label: 'Zakir D → D1 Management', start: 'ZAKIR_D', dest: 'D1' },
  ];

  const applyPreset = (preset) => {
    const s = locations.find((l) => l.id === preset.start || l.code === preset.start);
    const d = locations.find((l) => l.id === preset.dest || l.code === preset.dest);
    if (s && d) {
      setStartLocation(s);
      setDestLocation(d);
      onFindRoute(s.id, d.id);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="cu-logo-img-wrapper" style={{ height: 38, padding: '2px 6px' }}>
              <img src="/cu-logo.png" alt="CU" style={{ height: 32, maxWidth: 120, objectFit: 'contain' }} />
            </div>
            <div>
              <div className="cu-nav-main-title" style={{ fontSize: 17, letterSpacing: 0.5 }}>
                <span className="cu-nav-red">SMART CAMPUS</span>
                <span className="cu-nav-light">NAVIGATOR</span>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: 0.3 }}>
                CHANDIGARH UNIVERSITY • ADSA
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Selector Card */}
        <div className="nav-card">
          <div className="nav-card-header">
            <div className="nav-card-title">
              <Compass size={16} color="#C53030" />
              <span>Campus Navigator</span>
            </div>
            {activeRoute && (
              <button
                onClick={onClearRoute}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="route-inputs-wrapper">
            {/* Start Location Selector */}
            <div className="input-group" ref={startRef}>
              <label className="input-label">
                <MapPin size={13} color="#22C55E" />
                <span>STARTING POINT</span>
              </label>
              <div className="searchable-select">
                <div
                  className={`select-box ${startDropdownOpen ? 'active' : ''}`}
                  onClick={() => setStartDropdownOpen(!startDropdownOpen)}
                >
                  {startLocation ? (
                    <div className="select-val">
                      <span className="item-code" style={{ marginRight: 6 }}>{startLocation.code}</span>
                      <span>{startLocation.name}</span>
                    </div>
                  ) : (
                    <span className="select-placeholder">Select starting location...</span>
                  )}
                  <ChevronDown size={14} color="#64748B" />
                </div>

                {startDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-search">
                      <input
                        type="text"
                        placeholder="Search building code, hostel, or name..."
                        className="dropdown-input"
                        value={startSearchText}
                        onChange={(e) => setStartSearchText(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {filteredStartLocations.map((loc) => (
                      <div
                        key={`start-${loc.id}`}
                        className="dropdown-item"
                        onClick={() => {
                          setStartLocation(loc);
                          setStartDropdownOpen(false);
                          setStartSearchText('');
                        }}
                      >
                        <span className="item-code">{loc.code}</span>
                        <span className="item-name">{loc.name}</span>
                        <span className="item-cat-badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          {loc.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="swap-btn-container">
              <button className="swap-btn" onClick={handleSwap} title="Swap Start & Destination">
                <ArrowUpDown size={14} />
              </button>
            </div>

            {/* Destination Location Selector */}
            <div className="input-group" ref={destRef}>
              <label className="input-label">
                <Navigation size={13} color="#EF4444" />
                <span>DESTINATION</span>
              </label>
              <div className="searchable-select">
                <div
                  className={`select-box ${destDropdownOpen ? 'active' : ''}`}
                  onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                >
                  {destLocation ? (
                    <div className="select-val">
                      <span className="item-code" style={{ marginRight: 6 }}>{destLocation.code}</span>
                      <span>{destLocation.name}</span>
                    </div>
                  ) : (
                    <span className="select-placeholder">Select destination...</span>
                  )}
                  <ChevronDown size={14} color="#64748B" />
                </div>

                {destDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-search">
                      <input
                        type="text"
                        placeholder="Search destination building..."
                        className="dropdown-input"
                        value={destSearchText}
                        onChange={(e) => setDestSearchText(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {filteredDestLocations.map((loc) => (
                      <div
                        key={`dest-${loc.id}`}
                        className="dropdown-item"
                        onClick={() => {
                          setDestLocation(loc);
                          setDestDropdownOpen(false);
                          setDestSearchText('');
                        }}
                      >
                        <span className="item-code">{loc.code}</span>
                        <span className="item-name">{loc.name}</span>
                        <span className="item-cat-badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          {loc.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Walking Speed Control */}
          <div className="speed-control">
            <div className="speed-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Footprints size={14} />
                <span>Walking Speed:</span>
              </span>
              <span className="speed-value">{walkingSpeed.toFixed(1)} m/s ({(walkingSpeed * 3.6).toFixed(1)} km/h)</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.2"
              step="0.1"
              value={walkingSpeed}
              onChange={(e) => setWalkingSpeed(parseFloat(e.target.value))}
              className="speed-slider"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-grid">
            <button
              className="action-btn find-route"
              disabled={loading || !startLocation || !destLocation}
              onClick={() => onFindRoute(startLocation?.id, destLocation?.id)}
            >
              <Navigation size={16} />
              <span>{loading ? 'Computing Graph...' : 'Find Optimal Route'}</span>
            </button>

            <button
              className="action-btn secondary"
              disabled={loading || !startLocation || !destLocation}
              onClick={() => onFindAlternatives(startLocation?.id, destLocation?.id)}
              title="Yen's K-Shortest Paths Algorithm"
            >
              <Route size={14} color="#38BDF8" />
              <span>Alternative Routes</span>
            </button>

            <button
              className="action-btn secondary"
              onClick={onClearRoute}
            >
              <RotateCcw size={14} color="#94A3B8" />
              <span>Reset Map</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <HelpCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Quick Route Verification Presets */}
        <div className="nav-card">
          <div className="nav-card-title">
            <Sparkles size={14} color="#D69E2E" />
            <span>Preset Faculty Test Cases</span>
          </div>
          <div className="presets-list">
            {testPresets.map((p, i) => (
              <button
                key={`preset-${i}`}
                className="preset-chip"
                onClick={() => applyPreset(p)}
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Route Details Panel (if route is active) */}
        {activeRoute && (
          <div className="nav-card" style={{ borderLeft: '4px solid #C53030' }}>
            {/* Alternative Route Tabs */}
            {alternativeRoutes && alternativeRoutes.length > 1 && (
              <div className="alt-tabs">
                {alternativeRoutes.map((r, idx) => (
                  <button
                    key={`alt-tab-${idx}`}
                    className={`alt-tab ${selectedRouteIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedRouteIndex(idx)}
                  >
                    {idx === 0 ? 'Shortest' : `Alt ${idx}`} ({Math.round(r.totalDistance)}m)
                  </button>
                ))}
              </div>
            )}

            <div className="nav-card-header">
              <div className="nav-card-title">
                <Route size={16} color="#22C55E" />
                <span>{activeRoute.routeLabel || 'Calculated Route'}</span>
              </div>
              <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 600 }}>C++ Dijkstra</span>
            </div>

            {/* Metrics */}
            <div className="route-metrics-row">
              <div className="metric-card">
                <div className="metric-val">{Math.round(activeRoute.totalDistance)}m</div>
                <div className="metric-label">Estimated Dist</div>
              </div>
              <div className="metric-card">
                <div className="metric-val" style={{ color: '#D69E2E' }}>
                  {formatTime(activeRoute.walkingTimeSeconds)}
                </div>
                <div className="metric-label">Walk Time</div>
              </div>
              <div className="metric-card">
                <div className="metric-val" style={{ color: '#38BDF8' }}>
                  {activeRoute.intersectionsCount}
                </div>
                <div className="metric-label">Waypoints</div>
              </div>
            </div>

            {/* Turn-by-Turn Directions */}
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginTop: 10 }}>
              STEP-BY-STEP DIRECTIONS:
            </div>
            <div className="directions-list">
              {activeRoute.directions?.map((step) => (
                <div key={`step-${step.stepNumber}`} className="direction-step">
                  <div className="step-num-badge">{step.stepNumber}</div>
                  <div className="step-instruction">
                    <div>{step.instruction}</div>
                    <div className="step-meta">
                      <span>Path: {step.pathwayName}</span>
                      <span>•</span>
                      <span>{Math.round(step.distance)}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Facilities Quick Access Card */}
        {nearbyData && nearbyData.highlights && (
          <div className="nav-card">
            <div className="nav-card-header">
              <div className="nav-card-title">
                <Layers size={15} color="#38BDF8" />
                <span>Nearest Facilities from {startLocation?.code || 'Location'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {nearbyData.highlights.library && (
                <div
                  className="preset-chip"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 8 }}
                  onClick={() => onSelectNearbyFacility(nearbyData.highlights.library)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3B82F6' }}>
                    <BookOpen size={12} />
                    <span style={{ fontWeight: 800 }}>Nearest Library</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>
                    {nearbyData.highlights.library.code}
                  </span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>
                    {Math.round(nearbyData.highlights.library.distance)}m ({formatTime(nearbyData.highlights.library.walkingTimeSeconds)})
                  </span>
                </div>
              )}

              {nearbyData.highlights.cafeteria && (
                <div
                  className="preset-chip"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 8 }}
                  onClick={() => onSelectNearbyFacility(nearbyData.highlights.cafeteria)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#EA580C' }}>
                    <Coffee size={12} />
                    <span style={{ fontWeight: 800 }}>Nearest Dining</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>
                    {nearbyData.highlights.cafeteria.code}
                  </span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>
                    {Math.round(nearbyData.highlights.cafeteria.distance)}m ({formatTime(nearbyData.highlights.cafeteria.walkingTimeSeconds)})
                  </span>
                </div>
              )}

              {nearbyData.highlights.sports && (
                <div
                  className="preset-chip"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 8 }}
                  onClick={() => onSelectNearbyFacility(nearbyData.highlights.sports)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16A34A' }}>
                    <Dumbbell size={12} />
                    <span style={{ fontWeight: 800 }}>Nearest Sports</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>
                    {nearbyData.highlights.sports.code}
                  </span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>
                    {Math.round(nearbyData.highlights.sports.distance)}m ({formatTime(nearbyData.highlights.sports.walkingTimeSeconds)})
                  </span>
                </div>
              )}

              {nearbyData.highlights.hostel && (
                <div
                  className="preset-chip"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 8 }}
                  onClick={() => onSelectNearbyFacility(nearbyData.highlights.hostel)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#805AD5' }}>
                    <Home size={12} />
                    <span style={{ fontWeight: 800 }}>Nearest Hostel</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>
                    {nearbyData.highlights.hostel.code}
                  </span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>
                    {Math.round(nearbyData.highlights.hostel.distance)}m ({formatTime(nearbyData.highlights.hostel.walkingTimeSeconds)})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

