import React from 'react';
import { X, MapPin, Navigation, Info, Compass, Layers, Check } from 'lucide-react';

export default function BuildingDetailModal({
  building = null,
  isOpen = false,
  onClose = () => {},
  onSetAsStart = () => {},
  onSetAsDest = () => {},
  onFindNearby = () => {},
}) {
  if (!isOpen || !building) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                background: '#C53030',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: 6,
              }}
            >
              {building.code}
            </span>
            <span className="modal-title" style={{ fontSize: 16 }}>{building.name}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.1)',
                color: '#38BDF8',
              }}
            >
              Category: {building.category}
            </span>
          </div>

          <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>
            {building.description}
          </p>

          {building.departments && building.departments.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>
                DEPARTMENTS & FACILITIES:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {building.departments.map((dept, idx) => (
                  <span
                    key={`dept-${idx}`}
                    style={{
                      background: '#0F172A',
                      border: '1px solid #334155',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      color: '#E2E8F0',
                    }}
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            <button
              className="action-btn secondary"
              style={{ borderColor: '#22C55E', color: '#4ADE80' }}
              onClick={() => {
                onSetAsStart(building);
                onClose();
              }}
            >
              <MapPin size={14} />
              <span>Set as Start</span>
            </button>

            <button
              className="action-btn secondary"
              style={{ borderColor: '#EF4444', color: '#F87171' }}
              onClick={() => {
                onSetAsDest(building);
                onClose();
              }}
            >
              <Navigation size={14} />
              <span>Set as Destination</span>
            </button>
          </div>

          <button
            className="action-btn secondary"
            style={{ width: '100%', marginTop: -4 }}
            onClick={() => {
              onFindNearby(building);
              onClose();
            }}
          >
            <Compass size={14} color="#D69E2E" />
            <span>Explore Nearby Facilities from Here</span>
          </button>
        </div>
      </div>
    </div>
  );
}

