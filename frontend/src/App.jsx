import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CampusMap from './components/CampusMap';
import AdsaInfoModal from './components/AdsaInfoModal';
import RestrictedPathManager from './components/RestrictedPathManager';
import BfsExplorerModal from './components/BfsExplorerModal';
import StatsModal from './components/StatsModal';
import BuildingDetailModal from './components/BuildingDetailModal';
import { api } from './services/api';

export default function App() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cu_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cu_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Campus Data State
  const [locations, setLocations] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [serverConnected, setServerConnected] = useState(false);

  // Navigation State
  const [startLocation, setStartLocation] = useState(null);
  const [destLocation, setDestLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [walkingSpeed, setWalkingSpeed] = useState(1.2);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Features State
  const [nearbyData, setNearbyData] = useState(null);
  const [restrictedPaths, setRestrictedPaths] = useState([]);
  const [bfsResults, setBfsResults] = useState(null);
  const [stats, setStats] = useState({});
  const [adsaData, setAdsaData] = useState(null);

  // Modal States
  const [isAdsaOpen, setIsAdsaOpen] = useState(false);
  const [isRestrictedOpen, setIsRestrictedOpen] = useState(false);
  const [isBfsOpen, setIsBfsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [inspectBuilding, setInspectBuilding] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial Load: Fetch campus data and verify C++ backend
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [locs, graph, restr, stat, adsa] = await Promise.all([
          api.getLocations(),
          api.getGraph(),
          api.getRestrictedPaths(),
          api.getStatistics(),
          api.getAdsaInfo(),
        ]);

        setLocations(locs);
        setGraphData(graph);
        setRestrictedPaths(restr.restrictedPaths || []);
        setStats(stat);
        setAdsaData(adsa);
        setServerConnected(true);

        // Set default start and destination for quick demonstration
        const nc1 = locs.find((l) => l.code === 'NC1');
        const d6 = locs.find((l) => l.code === 'D6');
        if (nc1) setStartLocation(nc1);
        if (d6) setDestLocation(d6);

        // Fetch nearby for initial start
        if (nc1) {
          const nb = await api.findNearby(nc1.id, 1.2);
          setNearbyData(nb);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Cannot connect to C++ backend. Ensure smart_campus_server is running on port 18080.');
        setServerConnected(false);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Update nearby facilities whenever start location changes
  useEffect(() => {
    if (startLocation) {
      api.findNearby(startLocation.id, walkingSpeed)
        .then((data) => setNearbyData(data))
        .catch(() => {});
    }
  }, [startLocation, walkingSpeed]);

  // Recalculate walking time if speed slider changes on an active route
  useEffect(() => {
    if (activeRoute && walkingSpeed > 0) {
      setActiveRoute((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          walkingTimeSeconds: prev.totalDistance / walkingSpeed,
        };
      });
    }
  }, [walkingSpeed]);

  // Find Shortest Route (Dijkstra)
  const handleFindRoute = async (srcId, dstId) => {
    const s = srcId || startLocation?.id;
    const d = dstId || destLocation?.id;
    if (!s || !d) {
      setError('Please select both starting point and destination.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.findRoute(s, d, walkingSpeed);
      if (res.valid) {
        setActiveRoute(res);
        setAlternativeRoutes([res]);
        setSelectedRouteIndex(0);
        // Refresh statistics
        api.getStatistics().then((st) => setStats(st)).catch(() => {});
      } else {
        setError(res.error || 'No path available between selected locations.');
        setActiveRoute(null);
      }
    } catch (err) {
      setError(err.message || 'Error computing route.');
      setActiveRoute(null);
    } finally {
      setLoading(false);
    }
  };

  // Find Alternative Routes (Yen's K-Shortest Paths)
  const handleFindAlternatives = async (srcId, dstId) => {
    const s = srcId || startLocation?.id;
    const d = dstId || destLocation?.id;
    if (!s || !d) {
      setError('Please select both starting point and destination.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.findAlternatives(s, d, 3, walkingSpeed);
      if (res.routes && res.routes.length > 0) {
        setAlternativeRoutes(res.routes);
        setActiveRoute(res.routes[0]);
        setSelectedRouteIndex(0);
        api.getStatistics().then((st) => setStats(st)).catch(() => {});
      } else {
        setError('No alternative paths found.');
      }
    } catch (err) {
      setError(err.message || 'Error computing alternative routes.');
    } finally {
      setLoading(false);
    }
  };

  // Handle switching between alternative route tabs
  const handleSelectRouteIndex = (idx) => {
    if (alternativeRoutes && alternativeRoutes[idx]) {
      setSelectedRouteIndex(idx);
      setActiveRoute(alternativeRoutes[idx]);
    }
  };

  // Clear route
  const handleClearRoute = () => {
    setActiveRoute(null);
    setAlternativeRoutes([]);
    setError(null);
    setBfsResults(null);
  };

  // Toggle pathway restriction
  const handleToggleRestriction = async (u, v, restricted) => {
    try {
      await api.toggleRestrictedPath(u, v, restricted);
      const restr = await api.getRestrictedPaths();
      setRestrictedPaths(restr.restrictedPaths || []);

      // If active route, auto-recalculate
      if (startLocation && destLocation && activeRoute) {
        handleFindRoute(startLocation.id, destLocation.id);
      }
    } catch (err) {
      console.error('Failed to toggle restriction:', err);
    }
  };

  // Reset all restrictions
  const handleResetRestrictions = async () => {
    try {
      await api.resetRestrictions();
      const restr = await api.getRestrictedPaths();
      setRestrictedPaths(restr.restrictedPaths || []);
      if (startLocation && destLocation && activeRoute) {
        handleFindRoute(startLocation.id, destLocation.id);
      }
    } catch (err) {
      console.error('Failed to reset restrictions:', err);
    }
  };

  // Run BFS
  const handleRunBfs = async (sourceId, maxHops) => {
    try {
      setLoading(true);
      const res = await api.runBFS(sourceId, maxHops);
      setBfsResults(res);
    } catch (err) {
      console.error('Failed to run BFS:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick route to nearby facility
  const handleSelectNearbyFacility = (fac) => {
    const loc = locations.find((l) => l.id === fac.id);
    if (loc && startLocation) {
      setDestLocation(loc);
      handleFindRoute(startLocation.id, loc.id);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar
        serverConnected={serverConnected}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAdsaModal={() => setIsAdsaOpen(true)}
        onOpenRestrictedModal={() => setIsRestrictedOpen(true)}
        onOpenBfsModal={() => setIsBfsOpen(true)}
        onOpenStatsModal={() => setIsStatsOpen(true)}
      />

      {/* Main Split Layout */}
      <div className="main-layout">
        {/* Left Interactive Sidebar */}
        <Sidebar
          locations={locations}
          startLocation={startLocation}
          destLocation={destLocation}
          setStartLocation={setStartLocation}
          setDestLocation={setDestLocation}
          onFindRoute={handleFindRoute}
          onFindAlternatives={handleFindAlternatives}
          onClearRoute={handleClearRoute}
          activeRoute={activeRoute}
          alternativeRoutes={alternativeRoutes}
          selectedRouteIndex={selectedRouteIndex}
          setSelectedRouteIndex={handleSelectRouteIndex}
          walkingSpeed={walkingSpeed}
          setWalkingSpeed={setWalkingSpeed}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          nearbyData={nearbyData}
          onSelectNearbyFacility={handleSelectNearbyFacility}
          loading={loading}
          error={error}
        />

        {/* Center/Right Interactive SVG Campus Map */}
        <CampusMap
          locations={locations}
          graphData={graphData}
          activeRoute={activeRoute}
          startLocation={startLocation}
          destLocation={destLocation}
          onSelectBuilding={(building) => setInspectBuilding(building)}
          categoryFilter={categoryFilter}
          bfsResults={bfsResults}
          restrictedPaths={restrictedPaths}
          theme={theme}
        />
      </div>

      {/* Modals */}
      <AdsaInfoModal
        isOpen={isAdsaOpen}
        onClose={() => setIsAdsaOpen(false)}
        adsaData={adsaData}
      />

      <RestrictedPathManager
        isOpen={isRestrictedOpen}
        onClose={() => setIsRestrictedOpen(false)}
        graphData={graphData}
        restrictedPaths={restrictedPaths}
        onToggleRestriction={handleToggleRestriction}
        onResetRestrictions={handleResetRestrictions}
      />

      <BfsExplorerModal
        isOpen={isBfsOpen}
        onClose={() => setIsBfsOpen(false)}
        locations={locations}
        onRunBfs={handleRunBfs}
        onClearBfs={() => setBfsResults(null)}
        bfsResults={bfsResults}
        loading={loading}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <BuildingDetailModal
        building={inspectBuilding}
        isOpen={!!inspectBuilding}
        onClose={() => setInspectBuilding(null)}
        onSetAsStart={(b) => setStartLocation(b)}
        onSetAsDest={(b) => setDestLocation(b)}
        onFindNearby={(b) => {
          setStartLocation(b);
          api.findNearby(b.id, walkingSpeed).then((nb) => setNearbyData(nb));
        }}
      />
    </div>
  );
}

