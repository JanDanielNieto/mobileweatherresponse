import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FREQUENT_LOCATIONS_KEY = 'frequentLocationsHistory';

const mockData = [
  { name: 'Quezon City', count: 12 },
  { name: 'Manila', count: 9 },
  { name: 'Davao City', count: 7 },
  { name: 'Cebu City', count: 5 },
  { name: 'Makati', count: 3 },
];

const EMERGENCIES_LIST_KEY = 'emergenciesList';

const AnalyticsWidget = ({ isPopupOpen }) => {
  const [data, setData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [viewMode, setViewMode] = useState('cities'); // 'cities' | 'types'

  useEffect(() => {
    if (!isPopupOpen) {
      // Delay visibility to allow popup to fade out
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isPopupOpen]);

  useEffect(() => {
    try {
      if (viewMode === 'cities') {
        const historyString = localStorage.getItem(FREQUENT_LOCATIONS_KEY);
        const history = historyString ? JSON.parse(historyString) : [];

        if (history.length > 0) {
          const cityCounts = history.reduce((acc, record) => {
            const city = record.city || 'Unknown';
            acc[city] = (acc[city] || 0) + 1;
            return acc;
          }, {});

          const chartData = Object.entries(cityCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Get top 5

          setData(chartData);
        } else {
          setData(mockData);
        }
      } else {
        // Global emergencies per type
        const listString = localStorage.getItem(EMERGENCIES_LIST_KEY);
        const list = listString ? JSON.parse(listString) : [];
        if (list.length > 0) {
          const typeCounts = list.reduce((acc, it) => {
            const type = (it.type || 'Unknown').trim();
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          const chartData = Object.entries(typeCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
          setData(chartData);
        } else {
          // Fallback sample types
          setData([
            { name: 'Flood', count: 8 },
            { name: 'Earthquake', count: 5 },
            { name: 'Fire', count: 4 },
            { name: 'Landslide', count: 3 }
          ]);
        }
      }
    } catch (error) {
      console.error('Error processing analytics data:', error);
      setData(mockData);
    }
  }, [viewMode]);

  return (
    <div className={`absolute top-28 bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-lg z-[1000] w-96 max-w-[90vw] transition-all duration-500 ease-in-out ${isVisible ? 'left-2 opacity-100' : '-left-full opacity-0'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-lg font-bold">Analytics</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300">Metric: Emergencies</span>
          <button
            className={`text-xs px-2 py-1 rounded ${viewMode === 'cities' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            onClick={() => setViewMode('cities')}
            aria-label="View by Cities"
          >Cities</button>
          <button
            className={`text-xs px-2 py-1 rounded ${viewMode === 'types' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
            onClick={() => setViewMode('types')}
            aria-label="View by Types"
          >Types</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis type="number" stroke="#ccc" />
          <YAxis type="category" dataKey="name" stroke="#ccc" width={60} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} labelStyle={{ color: '#fff' }} />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsWidget;
