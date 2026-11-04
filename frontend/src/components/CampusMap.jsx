import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Compass, MapPin, Navigation, Info, AlertTriangle } from 'lucide-react';

export default function CampusMap({
  locations = [],
  graphData = null,
  activeRoute = null,
  startLocation = null,
  destLocation = null,
  onSelectBuilding = () => {},
  categoryFilter = 'all',
  bfsResults = null,
  restrictedPaths = [],
  theme = 'dark'
}) {
  const svgRef = useRef(null);

  const isLight = theme === 'light';

  const pal = {
    bg: isLight ? '#F8FAFC' : '#0B1120',
    grid: isLight ? '#E2E8F0' : '#1E293B',
    highwayOuter: isLight ? '#CBD5E1' : '#1E293B',
    highwayInner: isLight ? '#E2E8F0' : '#334155',
    highwayDash: isLight ? '#94A3B8' : '#64748B',
    roadOuter: isLight ? '#CBD5E1' : '#1E293B',
    roadInner: isLight ? '#F1F5F9' : '#283548',
    edgeStroke: isLight ? '#94A3B8' : '#334155',
    grassFieldBg: isLight ? '#DCFCE7' : '#1B382B',
    grassFieldDot: isLight ? '#BBF7D0' : '#234E3C',
    mainGroundStroke: isLight ? '#10B981' : '#22C55E',
    mainGroundText: isLight ? '#047857' : '#4ADE80',
    sportsTrackBg: isLight ? '#DCFCE7' : '#14532D',
    sportsTrackBorder: isLight ? '#16A34A' : '#4ADE80',
    sportsTurf: isLight ? '#86EFAC' : '#166534',
    sportsTurfText: isLight ? '#14532D' : '#86EFAC',
    openTheatreOuter: isLight ? '#E2E8F0' : '#1E293B',
    openTheatreInner: isLight ? '#BBF7D0' : '#166534',
    openTheatreText: isLight ? '#14532D' : '#86EFAC',
    fountainParkBg: isLight ? '#E0F2FE' : '#064E3B',
    fountainParkBorder: isLight ? '#0284C7' : '#10B981',
    fountainWater: isLight ? '#38BDF8' : '#0284C7',
    fountainText: isLight ? '#0369A1' : '#FFFFFF',
    compassBg: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.85)',
    compassBorder: isLight ? '#CBD5E1' : '#334155',
    compassText: isLight ? '#0F172A' : '#E2E8F0',
    ctrlBg: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.9)',
    ctrlBorder: isLight ? '#CBD5E1' : '#334155',
    ctrlColor: isLight ? '#0F172A' : '#F8FAFC',
    tooltipBg: isLight ? 'rgba(255, 255, 255, 0.97)' : 'rgba(15, 23, 42, 0.95)',
    tooltipBorder: isLight ? '#CBD5E1' : '#475569',
    tooltipTitle: isLight ? '#0F172A' : '#FFFFFF',
    tooltipDesc: isLight ? '#475569' : '#94A3B8',
  };

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 3.5));
  };

  // Convert route coordinates to SVG points string
  const routePoints = activeRoute?.nodes?.map((n) => `${n.coordinates.x},${n.coordinates.y}`).join(' ') || '';

  // Get color for building
  const getBuildingColor = (loc) => {
    if (startLocation?.id === loc.id) return '#22C55E';
    if (destLocation?.id === loc.id) return '#EF4444';

    switch (loc.category) {
      case 'academic': return '#DC2626'; // CU Crimson
      case 'hostel': return '#7C3AED'; // Purple
      case 'sports': return '#16A34A'; // Green
      case 'library': return '#2563EB'; // Royal Blue
      case 'cafeteria': return '#EA580C'; // Warm Orange
      case 'admin': return '#0D9488'; // Teal
      case 'landmark': return '#D97706'; // Gold/Amber
      case 'parking': return '#475569'; // Slate
      case 'gate': return '#64748B'; // Gray
      default: return '#3B82F6';
    }
  };

  const isRestrictedEdge = (uId, vId) => {
    return restrictedPaths.some(
      (rp) => (rp.uId === uId && rp.vId === vId) || (rp.uId === vId && rp.vId === uId)
    );
  };

  // BFS hop lookup
  const getBfsHops = (locId) => {
    if (!bfsResults?.visitedNodes) return null;
    const match = bfsResults.visitedNodes.find((n) => n.id === locId);
    return match ? match.hops : null;
  };

  return (
    <div className="map-container" onWheel={handleWheel}>
      {/* Zoom / Pan Controls Overlay */}
      <div className="map-controls-overlay">
        <button className="map-ctrl-btn" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={18} />
        </button>
        <button className="map-ctrl-btn" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={18} />
        </button>
        <button className="map-ctrl-btn" onClick={handleReset} title="Reset View">
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Campus Map Compass & Scale */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 30, display: 'flex', alignItems: 'center', gap: 10, background: pal.compassBg, backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 8, border: `1px solid ${pal.compassBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Compass size={18} color="#D69E2E" />
        <span style={{ fontSize: 11, fontWeight: 700, color: pal.compassText, letterSpacing: 0.5 }}>CAMPUS ORIENTATION: NORTH ↑</span>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredBuilding && (
        <div
          style={{
            position: 'absolute',
            top: 65,
            left: 20,
            zIndex: 40,
            background: pal.tooltipBg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${pal.tooltipBorder}`,
            borderRadius: 8,
            padding: '10px 14px',
            maxWidth: 320,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#C53030', color: 'white', fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
              {hoveredBuilding.code}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pal.tooltipTitle }}>{hoveredBuilding.name}</span>
          </div>
          <div style={{ fontSize: 11, color: pal.tooltipDesc, marginTop: 4 }}>{hoveredBuilding.description}</div>
          <div style={{ fontSize: 10, color: '#38BDF8', marginTop: 4, textTransform: 'uppercase', fontWeight: 600 }}>
            Category: {hoveredBuilding.category}
          </div>
        </div>
      )}

      {/* Main SVG Canvas */}
      <svg
        ref={svgRef}
        className={`campus-svg-canvas ${isDragging ? 'dragging' : ''}`}
        viewBox="0 0 1600 900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={pal.grid} strokeWidth="0.8" />
          </pattern>

          {/* Grass Field Pattern */}
          <pattern id="grassField" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill={pal.grassFieldBg} />
            <circle cx="5" cy="5" r="1.5" fill={pal.grassFieldDot} />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background Canvas */}
          <rect width="1600" height="900" fill={pal.bg} />
          <rect width="1600" height="900" fill="url(#campusGrid)" />

          {/* Outer Boundary & Highway Road (Top) */}
          <path
            d="M 280 90 L 1520 170"
            stroke={pal.highwayOuter}
            strokeWidth="32"
            strokeLinecap="round"
          />
          <path
            d="M 280 90 L 1520 170"
            stroke={pal.highwayInner}
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 280 90 L 1520 170"
            stroke={pal.highwayDash}
            strokeWidth="2"
            strokeDasharray="12 12"
          />
          <text x="310" y="80" fill={pal.highwayDash} fontSize="12" fontWeight="700" letterSpacing="1">
            CHANDIGARH - LUDHIANA HIGHWAY (NH-05)
          </text>

          {/* Major Campus Internal Roads */}
          {/* Diagonal Central Avenue */}
          <path
            d="M 670 410 L 880 410 L 1050 410 L 1180 470 L 1280 470 L 1400 240"
            stroke={pal.roadOuter}
            strokeWidth="18"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M 670 410 L 880 410 L 1050 410 L 1180 470 L 1280 470 L 1400 240"
            stroke={pal.roadInner}
            strokeWidth="12"
            fill="none"
            strokeLinejoin="round"
          />

          {/* East Roundabout at Gate 1 */}
          <circle cx="1400" cy="240" r="32" fill={pal.roadOuter} stroke={pal.roadInner} strokeWidth="6" />
          <circle cx="1400" cy="240" r="16" fill={pal.mainGroundStroke} stroke={pal.mainGroundText} strokeWidth="2" />
          <text x="1400" y="243" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle">CU</text>

          {/* Main Ground (Green Lawn) */}
          <rect
            x="1195"
            y="480"
            width="75"
            height="85"
            rx="8"
            fill="url(#grassField)"
            stroke={pal.mainGroundStroke}
            strokeWidth="2"
            opacity="0.9"
          />
          <text x="1232" y="525" fill={pal.mainGroundText} fontSize="10" fontWeight="700" textAnchor="middle">
            MAIN GROUND
          </text>

          {/* Sports Ground (Turf + Running Track) */}
          <rect
            x="465"
            y="295"
            width="90"
            height="65"
            rx="14"
            fill={pal.sportsTrackBg}
            stroke={pal.sportsTrackBorder}
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          <rect
            x="475"
            y="305"
            width="70"
            height="45"
            rx="8"
            fill={pal.sportsTurf}
          />
          <text x="510" y="332" fill={pal.sportsTurfText} fontSize="10" fontWeight="800" textAnchor="middle">
            SPORTS GROUND
          </text>

          {/* Open Theatre (Hostel Amphitheatre) */}
          <circle cx="1120" cy="710" r="32" fill={pal.openTheatreOuter} stroke={pal.highwayDash} strokeWidth="2" />
          <circle cx="1120" cy="710" r="22" fill={pal.openTheatreInner} stroke={pal.sportsTrackBorder} strokeWidth="1.5" />
          <text x="1120" y="713" fill={pal.openTheatreText} fontSize="9" fontWeight="700" textAnchor="middle">
            OPEN THEATRE
          </text>

          {/* Fountain Park */}
          <rect
            x="1310"
            y="300"
            width="60"
            height="45"
            rx="10"
            fill={pal.fountainParkBg}
            stroke={pal.fountainParkBorder}
            strokeWidth="1.5"
          />
          <circle cx="1340" cy="322" r="10" fill={pal.fountainWater} stroke={pal.fountainParkBorder} strokeWidth="1" />
          <text x="1340" y="325" fill={pal.fountainText} fontSize="8" fontWeight="700" textAnchor="middle">Fountain</text>

          {/* Graph Pathway Edges */}
          {graphData?.edges?.map((e, idx) => {
            const uLoc = graphData.locations.find((l) => l.id === e.u);
            const vLoc = graphData.locations.find((l) => l.id === e.v);
            if (!uLoc || !vLoc) return null;

            const isRestricted = isRestrictedEdge(e.u, e.v);

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={uLoc.coordinates.x}
                  y1={uLoc.coordinates.y}
                  x2={vLoc.coordinates.x}
                  y2={vLoc.coordinates.y}
                  className={`pathway-line ${isRestricted ? 'restricted' : ''}`}
                />
                {isRestricted && (
                  <circle
                    cx={(uLoc.coordinates.x + vLoc.coordinates.x) / 2}
                    cy={(uLoc.coordinates.y + vLoc.coordinates.y) / 2}
                    r="6"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Active Navigation Route (Animated Line) */}
          {activeRoute && routePoints && (
            <polyline
              points={routePoints}
              className={`route-path-line ${
                activeRoute.routeLabel?.includes('Alternative Route 1')
                  ? 'alt-1'
                  : activeRoute.routeLabel?.includes('Alternative Route 2')
                  ? 'alt-2'
                  : ''
              }`}
            />
          )}

          {/* Buildings & Landmarks Rendering */}
          {locations.map((loc) => {
            const isSelectedStart = startLocation?.id === loc.id;
            const isSelectedDest = destLocation?.id === loc.id;
            const bfsHops = getBfsHops(loc.id);

            // Filter out non-matching categories if a specific filter is set
            if (categoryFilter !== 'all' && loc.category !== categoryFilter) {
              return null;
            }

            const color = getBuildingColor(loc);

            return (
              <g
                key={loc.id}
                transform={`translate(${loc.coordinates.x - loc.width / 2}, ${loc.coordinates.y - loc.height / 2})`}
                onClick={() => onSelectBuilding(loc)}
                onMouseEnter={() => setHoveredBuilding(loc)}
                onMouseLeave={() => setHoveredBuilding(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* BFS Ripple if part of BFS exploration */}
                {bfsHops !== null && (
                  <circle
                    cx={loc.width / 2}
                    cy={loc.height / 2}
                    r={Math.max(loc.width, loc.height) * 0.75}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                )}

                {/* Building Base Rectangle */}
                <rect
                  width={loc.width}
                  height={loc.height}
                  rx="6"
                  fill={color}
                  className={`building-shape ${isSelectedStart ? 'selected-start' : ''} ${
                    isSelectedDest ? 'selected-dest' : ''
                  }`}
                  style={{
                    filter: isSelectedStart || isSelectedDest ? undefined : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                  }}
                />

                {/* Building Code Badge / Text */}
                <text
                  x={loc.width / 2}
                  y={loc.height / 2 + 3}
                  fill="#FFFFFF"
                  fontSize={loc.width < 40 ? 9 : 11}
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {loc.code}
                </text>

                {/* Start Marker Pin Indicator */}
                {isSelectedStart && (
                  <g transform={`translate(${loc.width / 2 - 12}, -24)`}>
                    <rect x="0" y="0" width="24" height="20" rx="4" fill="#22C55E" />
                    <text x="12" y="14" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle">START</text>
                  </g>
                )}

                {/* Destination Marker Pin Indicator */}
                {isSelectedDest && (
                  <g transform={`translate(${loc.width / 2 - 12}, -24)`}>
                    <rect x="0" y="0" width="24" height="20" rx="4" fill="#EF4444" />
                    <text x="12" y="14" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle">END</text>
                  </g>
                )}

                {/* BFS Hop Count Badge */}
                {bfsHops !== null && (
                  <g transform={`translate(${loc.width - 8}, -6)`}>
                    <circle cx="8" cy="8" r="8" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x="8" y="11" fill="#FFFFFF" fontSize="8" fontWeight="800" textAnchor="middle">
                      {bfsHops}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Map Legend Overlay */}
      <div className="map-legend-overlay">
        <div className="legend-title">
          <span>Campus Legend</span>
          <span style={{ fontSize: 10, color: '#38BDF8' }}>Interactive</span>
        </div>
        <div className="legend-grid">
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#DC2626' }} />
            <span>Academic Blocks</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#7C3AED' }} />
            <span>Hostels (NC & Zakir)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#2563EB' }} />
            <span>Library (D6 KRC)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#16A34A' }} />
            <span>Sports Arenas</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#EA580C' }} />
            <span>Cafeterias & Dining</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#0D9488' }} />
            <span>Info & Student Centre</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#D97706' }} />
            <span>Orientation Venue</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ background: '#475569' }} />
            <span>Gates & Parking</span>
          </div>
        </div>
      </div>
    </div>
  );
}

