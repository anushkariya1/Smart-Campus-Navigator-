import React, { useState } from 'react';
import { X, Share2, Compass, Play, RotateCcw, CheckCircle } from 'lucide-react';

export default function BfsExplorerModal({
  isOpen,
  onClose,
  locations = [],
  onRunBfs = () => {},
  onClearBfs = () => {},
  bfsResults = null,
  loading = false,
}) {
  const [selectedSource, setSelectedSource] = useState(locations[0]?.id || 'NC1');
  const [maxHops, setMaxHops] = useState(2);

  if (!isOpen) return null;

  const validLocations = locations.filter((l) => !l.isJunction);

  const handleRun = () => {
    onRunBfs(selectedSource, maxHops);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Share2 size={20} color="#38BDF8" />
            <span>BFS Campus Traversal & Reachability Explorer</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 13, color: '#94A3B8' }}>
            Breadth First Search (BFS) operates level-by-level using an STL queue to discover all accessible
            facilities within $K$ walking connections, verifying campus network connectivity.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">EXPLORATION ORIGIN</label>
              <select
                className="dropdown-input"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                {validLocations.map((loc) => (
                  <option key={`bfs-loc-${loc.id}`} value={loc.id}>
                    [{loc.code}] {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">MAXIMUM HOP RADIUS: {maxHops} HOPS</label>
              <input
                type="range"
                min="1"
                max="5"
                value={maxHops}
                onChange={(e) => setMaxHops(parseInt(e.target.value))}
                className="speed-slider"
                style={{ marginTop: 8 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="action-btn find-route"
              style={{ flex: 1 }}
              disabled={loading}
              onClick={handleRun}
            >
              <Play size={14} />
              <span>{loading ? 'Running C++ BFS...' : 'Execute BFS Traversal'}</span>
            </button>

            {bfsResults && (
              <button
                className="action-btn secondary"
                onClick={onClearBfs}
              >
                <RotateCcw size={14} />
                <span>Clear Visuals</span>
              </button>
            )}
          </div>

          {/* Results Summary */}
          {bfsResults && (
            <div style={{ marginTop: 12, background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#38BDF8' }}>
                  Total Nodes Visited: {bfsResults.totalVisited}
                </span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  Origin: {bfsResults.sourceName}
                </span>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
                Traversal Order & Hop Levels:
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {bfsResults.visitedNodes?.map((vn, i) => (
                  <div
                    key={`vn-${i}`}
                    style={{
                      background: vn.hops === 0 ? '#C53030' : '#1E293B',
                      border: '1px solid #475569',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 11,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{vn.code}</span>
                    <span style={{ color: '#94A3B8' }}>Hop {vn.hops}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

