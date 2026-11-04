import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Check, RotateCcw, Lock, Unlock } from 'lucide-react';

export default function RestrictedPathManager({
  isOpen,
  onClose,
  graphData,
  restrictedPaths = [],
  onToggleRestriction = () => {},
  onResetRestrictions = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter edges
  const allEdges = graphData?.edges || [];
  const filteredEdges = allEdges.filter((e) => {
    const q = searchTerm.toLowerCase();
    const uLoc = graphData?.locations?.find((l) => l.id === e.u);
    const vLoc = graphData?.locations?.find((l) => l.id === e.v);
    const nameMatch = e.name?.toLowerCase().includes(q);
    const uMatch = uLoc?.name?.toLowerCase().includes(q) || uLoc?.code?.toLowerCase().includes(q);
    const vMatch = vLoc?.name?.toLowerCase().includes(q) || vLoc?.code?.toLowerCase().includes(q);
    return nameMatch || uMatch || vMatch;
  });

  const isEdgeRestricted = (u, v) => {
    return restrictedPaths.some(
      (rp) => (rp.uId === u && rp.vId === v) || (rp.uId === v && rp.vId === u)
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <ShieldAlert size={20} color="#F87171" />
            <span>Restricted Pathways & Barrier Management</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: 13, color: '#94A3B8' }}>
            Simulate campus maintenance, road construction, VIP barricades, or event closures.
            The C++ Dijkstra & Yen algorithms dynamically recalculate shortest alternative routes to circumvent restricted corridors.
          </div>

          {/* Active restrictions count & Reset button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0F172A', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>
                Active Blocked Walkways: <span style={{ color: '#EF4444' }}>{restrictedPaths.length}</span>
              </span>
            </div>
            {restrictedPaths.length > 0 && (
              <button
                className="action-btn secondary"
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={onResetRestrictions}
              >
                <RotateCcw size={12} />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder="Search pathway name or building..."
            className="dropdown-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Pathways list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
            {filteredEdges.map((e, idx) => {
              const uLoc = graphData?.locations?.find((l) => l.id === e.u);
              const vLoc = graphData?.locations?.find((l) => l.id === e.v);
              const restricted = isEdgeRestricted(e.u, e.v);

              return (
                <div
                  key={`pe-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: restricted ? 'rgba(239, 68, 68, 0.1)' : '#0F172A',
                    border: `1px solid ${restricted ? '#EF4444' : '#334155'}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: restricted ? '#F87171' : '#F8FAFC' }}>
                      {e.name || 'Campus Pathway'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                      {uLoc?.name || e.u} ↔ {vLoc?.name || e.v} ({e.distance}m)
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleRestriction(e.u, e.v, !restricted)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: restricted ? '#EF4444' : '#1E293B',
                      color: 'white',
                      border: `1px solid ${restricted ? '#EF4444' : '#475569'}`,
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {restricted ? (
                      <>
                        <Lock size={13} />
                        <span>Blocked (Click to Open)</span>
                      </>
                    ) : (
                      <>
                        <Unlock size={13} color="#22C55E" />
                        <span>Open (Click to Block)</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

