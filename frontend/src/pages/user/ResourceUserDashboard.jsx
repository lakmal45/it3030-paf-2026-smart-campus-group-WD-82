import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Users,
  BookOpen,
  Search,
  ChevronRight,
  Star,
  Filter,
  X
} from 'lucide-react';
import resourceService from '../../services/resourceService';

const ResourceUserDashboard = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    available: 0,
    booked: 0,
    maintenance: 0,
    total: 0
  });
  const [resourceTypes, setResourceTypes] = useState([]);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedType, selectedStatus, resources]);

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
      
      // Extract unique resource types
      const types = [...new Set(data.map(r => r.type))];
      setResourceTypes(types);
      
      // Calculate stats
      const stats = {
        available: data.filter(r => r.available && r.status === 'ACTIVE').length,
        booked: data.filter(r => !r.available).length,
        maintenance: data.filter(r => r.status === 'IN_MAINTENANCE').length,
        total: data.length
      };
      setStats(stats);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    if (selectedStatus) {
      if (selectedStatus === 'available') {
        filtered = filtered.filter(r => r.available && r.status === 'ACTIVE');
      } else if (selectedStatus === 'booked') {
        filtered = filtered.filter(r => !r.available);
      } else if (selectedStatus === 'maintenance') {
        filtered = filtered.filter(r => r.status === 'IN_MAINTENANCE');
      }
    }

    setFilteredResources(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
  };

  const getStatusBadge = (status, available) => {
    if (status === 'ACTIVE' && available) {
      return <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-100 text-emerald-700 flex items-center w-fit"><CheckCircle2 className="h-3 w-3 mr-1" /> Available</span>;
    }
    if (!available) {
      return <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-100 text-amber-700 flex items-center w-fit"><Calendar className="h-3 w-3 mr-1" /> Booked</span>;
    }
    return <span className="px-3 py-1 text-xs font-black rounded-full bg-rose-100 text-rose-700 flex items-center w-fit"><AlertTriangle className="h-3 w-3 mr-1" /> {status?.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Resource Discovery</h1>
        <p className="text-slate-600 text-sm sm:text-base">Browse available campus resources, labs, and equipment</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Available Now</p>
              <p className="text-3xl font-black text-emerald-900 mt-2">{stats.available}</p>
              <p className="text-xs text-emerald-700 mt-1">Ready for use</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Currently Booked</p>
              <p className="text-3xl font-black text-amber-900 mt-2">{stats.booked}</p>
              <p className="text-xs text-amber-700 mt-1">In use</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-6 rounded-2xl border border-rose-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Maintenance</p>
              <p className="text-3xl font-black text-rose-900 mt-2">{stats.maintenance}</p>
              <p className="text-xs text-rose-700 mt-1">Being serviced</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Resources</p>
              <p className="text-3xl font-black text-blue-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-700 mt-1">On campus</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500 text-sm"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 font-bold text-sm transition-colors"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Resource Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {resourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Availability</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="booked">Currently Booked</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>

            {(searchTerm || selectedType || selectedStatus) && (
              <button
                onClick={clearFilters}
                className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 font-bold text-sm transition-colors"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Filter Summary */}
        {(searchTerm || selectedType || selectedStatus) && (
          <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
            <p className="text-sm font-bold text-blue-900">
              Showing {filteredResources.length} of {resources.length} resources
            </p>
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Featured Resources or Filtered Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {searchTerm || selectedType || selectedStatus ? 'Search Results' : 'Featured Resources'}
          </h2>
          {!(searchTerm || selectedType || selectedStatus) && (
            <Link to="/dashboard/user/resources" className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : filteredResources.length === 0 && (searchTerm || selectedType || selectedStatus) ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">No Results Found</h3>
            <p className="text-slate-600 text-sm mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <X className="h-4 w-4" /> Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchTerm || selectedType || selectedStatus ? filteredResources : resources.slice(0, 6)).map((resource) => (
              <Link
                key={resource.id}
                to={`/dashboard/user/resources/${resource.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    {getStatusBadge(resource.status, resource.available)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{resource.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">
                      <MapPin className="h-3 w-3" /> {resource.location}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Capacity</p>
                      <p className="text-slate-900 font-bold text-lg mt-1">{resource.capacity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                      <p className="text-slate-900 font-bold text-lg mt-1 truncate">{resource.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-slate-500">View Details</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/user/bookings"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">My Bookings</p>
              <p className="text-xs text-slate-500">View your reservations</p>
            </div>
          </Link>

          <Link 
            to="/dashboard/user/resources"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Browse Resources</p>
              <p className="text-xs text-slate-500">Explore all facilities</p>
            </div>
          </Link>

          <Link 
            to="/dashboard/user/tickets"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">My Tickets</p>
              <p className="text-xs text-slate-500">Support requests</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceUserDashboard;

  const getStatusBadge = (status, available) => {
    if (status === 'ACTIVE' && available) {
      return <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-100 text-emerald-700 flex items-center w-fit"><CheckCircle2 className="h-3 w-3 mr-1" /> Available</span>;
    }
    if (!available) {
      return <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-100 text-amber-700 flex items-center w-fit"><Calendar className="h-3 w-3 mr-1" /> Booked</span>;
    }
    return <span className="px-3 py-1 text-xs font-black rounded-full bg-rose-100 text-rose-700 flex items-center w-fit"><AlertTriangle className="h-3 w-3 mr-1" /> {status?.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Resource Discovery</h1>
        <p className="text-slate-600 text-sm sm:text-base">Browse available campus resources, labs, and equipment</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Available Now</p>
              <p className="text-3xl font-black text-emerald-900 mt-2">{stats.available}</p>
              <p className="text-xs text-emerald-700 mt-1">Ready for use</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Currently Booked</p>
              <p className="text-3xl font-black text-amber-900 mt-2">{stats.booked}</p>
              <p className="text-xs text-amber-700 mt-1">In use</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-6 rounded-2xl border border-rose-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Maintenance</p>
              <p className="text-3xl font-black text-rose-900 mt-2">{stats.maintenance}</p>
              <p className="text-xs text-rose-700 mt-1">Being serviced</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Resources</p>
              <p className="text-3xl font-black text-blue-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-700 mt-1">On campus</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by name, type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500 text-sm"
          />
        </div>
      </div>

      {/* Featured Resources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Featured Resources</h2>
          <Link to="/dashboard/user/resources" className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                to={`/dashboard/user/resources/${resource.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    {getStatusBadge(resource.status, resource.available)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{resource.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">
                      <MapPin className="h-3 w-3" /> {resource.location}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Capacity</p>
                      <p className="text-slate-900 font-bold text-lg mt-1">{resource.capacity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                      <p className="text-slate-900 font-bold text-lg mt-1 truncate">{resource.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-slate-500">View Details</span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/user/bookings"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">My Bookings</p>
              <p className="text-xs text-slate-500">View your reservations</p>
            </div>
          </Link>

          <Link 
            to="/dashboard/user/resources"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Browse Resources</p>
              <p className="text-xs text-slate-500">Explore all facilities</p>
            </div>
          </Link>

          <Link 
            to="/dashboard/user/tickets"
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">My Tickets</p>
              <p className="text-xs text-slate-500">Support requests</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceUserDashboard;
