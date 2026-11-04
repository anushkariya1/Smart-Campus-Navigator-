import React from 'react';
import { X, BarChart3, Activity, Cpu, Layers, ShieldCheck, MapPin } from 'lucide-react';

export default function StatsModal({ isOpen, onClose, stats = {} }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BarChart3 size={20} color="#FBBF24" />
            <span>Navigation System Real-Time Statistics</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div className="metric-card" style={{ textAlign: 'left', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E53E3E', marginBottom: 4 }}>
                <MapPin size={16} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Total Campus Locations</span>
              </div>
              <div className="metric-val">{stats.totalLocations || 105}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                {stats.buildingsCount || 43} Key Buildings + {stats.junctionsCount || 62} Waypoints
              </div>
            </div>

            <div className="metric-card" style={{ textAlign: 'left', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8', marginBottom: 4 }}>
                <Layers size={16} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Walking Graph Pathways</span>
              </div>
              <div className="metric-val">{stats.walkingConnections || 127}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                Undirected graph edges with estimated metric weights
              </div>
            </div>

            <div className="metric-card" style={{ textAlign: 'left', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E', marginBottom: 4 }}>
                <Activity size={16} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Dijkstra Queries Executed</span>
              </div>
              <div className="metric-val">{stats.queriesProcessed || 0}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                Executed live by C++ Crow engine
              </div>
            </div>

            <div className="metric-card" style={{ textAlign: 'left', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D69E2E', marginBottom: 4 }}>
                <Cpu size={16} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Meters Calculated</span>
              </div>
              <div className="metric-val">{stats.totalMetersCalculated || 0}m</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                Avg Route: {stats.averageDistanceMeters || 0}m
              </div>
            </div>
          </div>

          <div style={{ background: '#0F172A', padding: 12, borderRadius: 8, border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} color="#22C55E" />
            <div style={{ fontSize: 12, color: '#CBD5E1' }}>
              Backend architecture: <strong>Crow C++ REST Server (Port 18080)</strong>, using asynchronous threads,
              native Winsock2 socket multiplexing, and in-memory Adjacency List graph representation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

