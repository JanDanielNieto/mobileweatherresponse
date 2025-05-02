import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      <div className="flex flex-col items-center">
        <button
          className="bg-green-500 text-white px-6 py-2 rounded mb-4 hover:bg-green-600"
          onClick={() => navigate("/weather")}
        >
          View Weather
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          onClick={() => navigate("/location")}
        >
          View Location
        </button>
      </div>
    </div>
  );
}