import React, { useMemo, useState } from 'react';
const telSanitize = (s) => {
  if (!s || typeof s !== 'string') return '';
  // take first phone if semicolon/comma separated
  const first = s.split(/;|,/)[0];
  // keep + and digits
  return (first.match(/[+\d]/g) || []).join('');
};

const getFacilityPhoneFromTags = (tags = {}) => {
  const cand = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || tags.mobile || tags.telephone;
  const tel = telSanitize(cand || '');
  return tel || '';
};

const Section = ({ title, items, onSelect, expandedKey, setExpandedKey, disasterPhone }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <h4 className="text-sm font-semibold text-gray-200 mb-1">{title}</h4>
      <ul className="space-y-1">
        {items.slice(0, 5).map((it, idx) => (
          <li key={`${it.lat},${it.lon}-${idx}`}>
            <button
              className="w-full text-left bg-gray-700 hover:bg-gray-600 rounded px-3 py-2 text-sm text-white"
              onClick={() => {
                onSelect(it);
                const key = `${it.lat},${it.lon}-${idx}`;
                setExpandedKey(expandedKey === key ? null : key);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="truncate mr-2">{it.name || 'Unnamed'}</span>
                {typeof it.distanceKm === 'number' && (
                  <span className="text-xs text-gray-300">{it.distanceKm.toFixed(1)} km</span>
                )}
              </div>
              {it.address && (
                <div className="text-xs text-gray-300 mt-1 truncate">{it.address}</div>
              )}
            </button>
            {/* Actions row */}
            {expandedKey === `${it.lat},${it.lon}-${idx}` && (
              <div className="mt-1 ml-1 mr-1 mb-2 flex flex-wrap gap-2">
                {/* Determine type by title */}
                {title === 'Hospitals' && (() => {
                  const tel = getFacilityPhoneFromTags(it.tags);
                  return (
                    <>
                      <a
                        className={`px-2 py-1 rounded text-xs ${tel ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                        href={tel ? `tel:${tel}` : undefined}
                        onClick={(e) => { if (!tel) e.preventDefault(); }}
                        title={tel ? `Call ${it.name}` : 'No phone listed'}
                      >
                        Call Hospital
                      </a>
                      <a
                        className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white"
                        href={`tel:${disasterPhone}`}
                        title="Call Disaster Office"
                      >
                        Call Disaster Office
                      </a>
                    </>
                  );
                })()}

                {title === 'Fire Stations' && (() => {
                  const tel = getFacilityPhoneFromTags(it.tags);
                  return (
                    <>
                      <a
                        className={`px-2 py-1 rounded text-xs ${tel ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                        href={tel ? `tel:${tel}` : undefined}
                        onClick={(e) => { if (!tel) e.preventDefault(); }}
                        title={tel ? `Call ${it.name}` : 'No phone listed'}
                      >
                        Call Fire Dept
                      </a>
                      <a
                        className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white"
                        href={`tel:${disasterPhone}`}
                        title="Call Disaster Office"
                      >
                        Call Disaster Office
                      </a>
                    </>
                  );
                })()}

                {title === 'Evacuation / Shelters' && (
                  <a
                    className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white"
                    href={`tel:${disasterPhone}`}
                    title="Call Disaster Office"
                  >
                    Call Disaster Office
                  </a>
                )}

                {title === 'DRRMO / Government' && (
                  <a
                    className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white"
                    href={`tel:${disasterPhone}`}
                    title="Call Disaster Office"
                  >
                    Call Disaster Office
                  </a>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function NearestCentersWidget({ visible, x = 0, y = 0, data, onClose, onSelectItem, onMove, onUnanchor }) {
  // drag state is transient; position is managed by parent via x,y
  const [expandedKey, setExpandedKey] = useState(null);

  const baseDisasterPhone = useMemo(() => {
    const envVal = import.meta.env?.VITE_DISASTER_OFFICE_PHONE;
    const lsVal = typeof window !== 'undefined' ? window.localStorage.getItem('DISASTER_OFFICE_PHONE') : '';
    const fallback = '911';
    const val = (envVal && String(envVal).trim()) || (lsVal && String(lsVal).trim()) || fallback;
    return telSanitize(val);
  }, []);
  const disasterPhone = useMemo(() => {
    // Prefer nearest DRRMO phone if available in data
    const list = data?.drrmo || [];
    for (const it of list) {
      const tel = getFacilityPhoneFromTags(it.tags);
      if (tel) return tel;
    }
    return baseDisasterPhone;
  }, [data, baseDisasterPhone]);

  const onMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = x;
    const initY = y;
    if (onUnanchor) onUnanchor();
    const onMoveHandler = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (onMove) onMove(initX + dx, initY + dy);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMoveHandler);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMoveHandler);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      className={`absolute z-[1100] w-80 max-w-[90vw] ${visible ? 'block' : 'hidden'}`}
      style={{ left: x, top: y }}
    >
      <div className="bg-gray-800 bg-opacity-95 rounded-lg shadow-lg border border-gray-700 overflow-hidden pointer-events-auto">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 cursor-move select-none" onMouseDown={onMouseDown}>
          <h3 className="text-white font-semibold">Nearby Facilities</h3>
          <button
            className="text-white text-lg leading-none hover:text-red-300"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {!data && (
            <div className="text-gray-300 text-sm">Fetching facilities…</div>
          )}
          {data && (
            <>
              <Section title="Hospitals" items={data.hospitals} onSelect={onSelectItem} expandedKey={expandedKey} setExpandedKey={setExpandedKey} disasterPhone={disasterPhone} />
              <Section title="Fire Stations" items={data.fireStations} onSelect={onSelectItem} expandedKey={expandedKey} setExpandedKey={setExpandedKey} disasterPhone={disasterPhone} />
              <Section title="Evacuation / Shelters" items={data.shelters} onSelect={onSelectItem} expandedKey={expandedKey} setExpandedKey={setExpandedKey} disasterPhone={disasterPhone} />
              <Section title="DRRMO / Government" items={data.drrmo} onSelect={onSelectItem} expandedKey={expandedKey} setExpandedKey={setExpandedKey} disasterPhone={disasterPhone} />
              {(!data.hospitals?.length && !data.fireStations?.length && !data.shelters?.length && !data.drrmo?.length) && (
                <div className="text-gray-300 text-sm">No nearby facilities found.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
