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

  const handleReset = (e) => {
    if (e) e.preventDefault();
    const reset = { name: "", type: "", location: "", available: "" };
    setFilters(reset);
    onSearch({});
  };
  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-wrap items-end gap-4 lg:gap-5">
        
        {/* Asset Name */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Asset Name</label>
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="e.g. Room 101.."
            className="w-full px-5 py-3 border border-slate-200 bg-slate-50/30 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none font-semibold text-slate-700 placeholder-slate-400 shadow-sm"
          />
        </div>

        {/* Category */}
        <div className="w-full sm:w-[200px] lg:flex-1 lg:min-w-[180px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Category</label>
          <div className="relative">
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="w-full pl-5 pr-12 py-3 border border-slate-200 bg-slate-50/30 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none font-semibold text-slate-700 appearance-none cursor-pointer shadow-sm"
            >
              <option value="">All Types</option>
              <option value="Room">Lecture Room</option>
              <option value="Lab">Scientific Lab</option>
              <option value="Equipment">Tangible Equipment</option>
              <option value="Lecture Hall">Theatre / Hall</option>
              <option value="Auditorium">Auditorium</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <RotateCcw className="h-4 w-4 rotate-90" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="e.g. Block A.."
            className="w-full px-5 py-3 border border-slate-200 bg-slate-50/30 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none font-semibold text-slate-700 placeholder-slate-400 shadow-sm"
          />
        </div>

        {/* Availability */}
        <div className="w-full sm:w-[180px] lg:flex-1 lg:min-w-[160px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Availability</label>
          <div className="relative">
            <select
              name="available"
              value={filters.available}
              onChange={handleChange}
              className="w-full pl-5 pr-12 py-3 border border-slate-200 bg-slate-50/30 rounded-2xl transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none font-semibold text-slate-700 appearance-none cursor-pointer shadow-sm"
            >
              <option value="">Any State</option>
              <option value="true">Available</option>
              <option value="false">Reserved</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-1 sm:flex-none items-center gap-2 min-w-[200px] sm:min-w-0">
          <button
            type="submit"
            className="flex-1 sm:px-8 h-[46px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md shadow-blue-200 font-bold flex items-center justify-center space-x-2 active:scale-95 group sm:min-w-[120px]"
          >
            <Search className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-xs uppercase tracking-widest">Search</span>
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="w-12 h-[46px] lg:w-auto lg:px-6 bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-100 border border-slate-200 rounded-2xl transition-all font-bold flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
            title="Reset Filters"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span className="text-xs uppercase tracking-widest hidden lg:inline">Reset</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ResourceFilters;
