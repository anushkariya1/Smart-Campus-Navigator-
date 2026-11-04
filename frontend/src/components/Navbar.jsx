import React from 'react';
import {
  Compass,
  GraduationCap,
  ShieldAlert,
  Share2,
  BarChart3,
  CheckCircle2,
  Layers,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({
  serverConnected = true,
  theme = 'dark',
  onToggleTheme = () => {},
  onOpenAdsaModal = () => {},
  onOpenRestrictedModal = () => {},
  onOpenBfsModal = () => {},
  onOpenStatsModal = () => {},
}) {
  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="cu-logo-img-wrapper" title="Chandigarh University">
          <img src="/cu-logo.png" alt="Chandigarh University" className="cu-logo-img" />
        </div>
        <div className="cu-divider-vertical" />
        <div className="cu-title-block">
          <div className="cu-nav-main-title">
            <span className="cu-nav-red">SMART CAMPUS</span>
            <span className="cu-nav-light">NAVIGATOR</span>
          </div>
          <div className="cu-nav-tagline">
            <span style={{ color: '#EF4444', fontWeight: 700 }}>Discover. Navigate. Empower.</span>
            <span>•</span>
            <span>Room Finder & ADSA Project</span>
          </div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Theme Toggle Button */}
        <button
          className="nav-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{ minWidth: 110, justifyContent: 'center' }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#FBBF24" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#6366F1" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Backend Connectivity Status */}
        <div className="server-status-pill" title="Crow C++ Engine connected on port 18080">
          <div className="status-dot" style={{ background: serverConnected ? '#22C55E' : '#EF4444' }} />
          <span>{serverConnected ? 'C++ Engine Live' : 'Backend Offline'}</span>
        </div>

        {/* ADSA Algorithms Documentation Button */}
        <button className="nav-btn primary" onClick={onOpenAdsaModal}>
          <GraduationCap size={15} />
          <span>ADSA Algorithms</span>
        </button>

        {/* Restricted Pathways Button */}
        <button className="nav-btn" onClick={onOpenRestrictedModal}>
          <ShieldAlert size={15} color="#F87171" />
          <span>Restricted Paths</span>
        </button>

        {/* BFS Explorer Button */}
        <button className="nav-btn" onClick={onOpenBfsModal}>
          <Share2 size={15} color="#38BDF8" />
          <span>BFS Explorer</span>
        </button>

        {/* Stats Button */}
        <button className="nav-btn" onClick={onOpenStatsModal}>
          <BarChart3 size={15} color="#FBBF24" />
          <span>Statistics</span>
        </button>
      </div>
    </header>
  );
}

