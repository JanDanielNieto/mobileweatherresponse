import React, { useEffect, useState } from 'react';

const ContextMenu = ({ x, y, map, onSearch, onSearchQuerySubmit, onSearchResultSelect, onPinEmergency, onCenterMap, onClose }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceId, setDebounceId] = useState(null);
  const isVisible = x !== null && y !== null;

  useEffect(() => {
    if (!searchOpen) return;
    if (debounceId) clearTimeout(debounceId);
    const id = setTimeout(async () => {
      if (!query.trim()) { setSuggestions([]); return; }
      setLoading(true);
      try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
        if (map) {
          const b = map.getBounds();
          const sw = b.getSouthWest();
          const ne = b.getNorthEast();
          url += `&viewbox=${sw.lng},${sw.lat},${ne.lng},${ne.lat}&bounded=1`;
          const c = map.getCenter();
          if (c && c.lat >= 4 && c.lat <= 21 && c.lng >= 116 && c.lng <= 127) {
            url += `&countrycodes=ph`;
          }
        }
        const resp = await fetch(url, { headers: { 'User-Agent': 'weather-risk-web/1.0' } });
        const data = await resp.json();
        const mapped = Array.isArray(data) ? data.map(r => ({ label: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) })) : [];
        setSuggestions(mapped);
      } catch (err) {
        console.error('Suggest failed:', err);
      }
      setLoading(false);
    }, 250);
    setDebounceId(id);
    return () => clearTimeout(id);
  }, [query, searchOpen, map]);

  return (
    <div
      className="absolute bg-gray-800 text-white rounded-md shadow-lg z-[1005] p-2"
      style={{ top: y || 0, left: x || 0, display: isVisible ? 'block' : 'none' }}
      onMouseLeave={onClose}
    >
      <ul className="space-y-1">
        <li>
          {!searchOpen ? (
            <button
              onClick={(e) => { e.stopPropagation(); setSearchOpen(true); onSearch(); }}
              className="w-full text-left px-3 py-1 hover:bg-gray-700 rounded"
            >
              Search Location
            </button>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    e.stopPropagation();
                    onSearchQuerySubmit(query.trim());
                    setSearchOpen(false);
                    onClose();
                  }
                }}
                placeholder="Search here..."
                className="w-48 bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!query.trim()) return;
                  onSearchQuerySubmit(query.trim());
                  setSearchOpen(false);
                  onClose();
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-2 py-1"
              >
                Go
              </button>
            </div>
          )}
        </li>
        {searchOpen && (
          <li>
            {loading && (
              <div className="px-3 py-1 text-xs text-gray-400">Searching…</div>
            )}
            {suggestions.length > 0 && (
              <ul className="bg-gray-700 rounded">
                {suggestions.map((s, idx) => (
                  <li key={`${s.lat},${s.lon}-${idx}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSearchResultSelect) onSearchResultSelect(s.lat, s.lon, s.label);
                        setSearchOpen(false);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-gray-600 text-sm"
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}
        <li>
          <button
            onClick={(e) => { e.stopPropagation(); onPinEmergency(); }}
            className="w-full text-left px-3 py-1 hover:bg-gray-700 rounded"
          >
            Pin Emergency
          </button>
        </li>
        <li>
          <button
            onClick={(e) => { e.stopPropagation(); onCenterMap(); }}
            className="w-full text-left px-3 py-1 hover:bg-gray-700 rounded"
          >
            Center Map Here
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
