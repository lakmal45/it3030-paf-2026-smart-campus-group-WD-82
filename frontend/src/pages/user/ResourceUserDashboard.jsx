import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, CheckCircle2, AlertTriangle, Calendar, Search, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const ResourceUserDashboard = () => {
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, booked: 0, maintenance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/resources');
        const allResources = response.data;
        
        // Filter resources based on search term
        const filteredResources = allResources.filter(resource => 
          resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setResources(filteredResources);

        // Calculate stats based on ALL resources, not filtered ones
        const total = allResources.length;
        const available = allResources.filter(r => r.status === 'ACTIVE' && r.available).length;
        const booked = allResources.filter(r => r.status === 'ACTIVE' && !r.available).length;
        const maintenance = allResources.filter(r => r.status === 'IN_MAINTENANCE').length;
        setStats({ total, available, booked, maintenance });

      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const handler = setTimeout(() => {
      fetchResources();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const getStatusBadge = (status, available) => {
    if (status === 'ACTIVE' && available) {
      return <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-100 text-emerald-700 flex items-center w-fit"><CheckCircle2 className="h-3 w-3 mr-1" /> AVAILABLE</span>;
    }
    if (status === 'ACTIVE' && !available) {
      return <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-100 text-amber-700 flex items-center w-fit"><Calendar className="h-3 w-3 mr-1" /> BOOKED</span>;
    }
    if (status === 'IN_MAINTENANCE') {
      return <span className="px-3 py-1 text-xs font-black rounded-full bg-rose-100 text-rose-700 flex items-center w-fit"><AlertTriangle className="h-3 w-3 mr-1" /> MAINTENANCE</span>;
    }
    return <span className="px-3 py-1 text-xs font-black rounded-full bg-slate-100 text-slate-700 flex items-center w-fit"><AlertTriangle className="h-3 w-3 mr-1" /> {status?.replace(/_/g, ' ')}</span>;
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
