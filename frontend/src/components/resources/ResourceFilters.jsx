import React, { useState } from "react";

const ResourceFilters = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    location: "",
    available: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const activeFilters = {};
    if (filters.name) activeFilters.name = filters.name;
    if (filters.type) activeFilters.type = filters.type;
    if (filters.location) activeFilters.location = filters.location;
    if (filters.available !== "") activeFilters.available = filters.available === "true";

    onSearch(activeFilters);
  };

  const handleReset = () => {
    const reset = { name: "", type: "", location: "", available: "" };
    setFilters(reset);
    onSearch({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Room 101..."
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Room">Room</option>
            <option value="Lab">Lab</option>
            <option value="Equipment">Equipment</option>
            <option value="Lecture Hall">Lecture Hall</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Building A..."
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Availability</label>
          <select
            name="available"
            value={filters.available}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="true">Available</option>
            <option value="false">Occupied</option>
          </select>
        </div>
        <div className="flex items-end space-x-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceFilters;
