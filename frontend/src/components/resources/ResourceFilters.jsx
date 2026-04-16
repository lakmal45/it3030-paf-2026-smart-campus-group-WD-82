import React, { useState } from "react";
import { Search, RotateCcw } from "lucide-react";

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
    <form onSubmit={handleSearch} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Asset Name</label>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="e.g. Room 101..."
            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none font-medium text-slate-900 placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Category</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-no-repeat bg-[right_1.25rem_center] appearance-none"
            style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')" }}
          >
            <option value="">All Types</option>
            <option value="Room">Lecture Room</option>
            <option value="Lab">Scientific Lab</option>
            <option value="Equipment">Tangible Equipment</option>
            <option value="Lecture Hall">Theatre / Hall</option>
            <option value="Auditorium">Auditorium</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="e.g. Block A..."
            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none font-medium text-slate-900 placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Availability</label>
          <select
            name="available"
            value={filters.available}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none font-bold text-slate-900 bg-no-repeat bg-[right_1.25rem_center] appearance-none"
            style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')" }}
          >
            <option value="">Any</option>
            <option value="true">Available</option>
            <option value="false">Reserved</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <button
            type="submit"
            className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-100 font-black flex items-center justify-center space-x-2 active:scale-95"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-black flex items-center justify-center space-x-2 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ResourceFilters;
