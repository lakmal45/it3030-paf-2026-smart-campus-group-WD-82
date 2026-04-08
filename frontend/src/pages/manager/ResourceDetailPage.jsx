import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Info, 
  Calendar, 
  Trash2, 
  Edit, 
  ToggleLeft, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import resourceService from "../../services/resourceService";
import { useAuth } from "../../context/AuthContext";

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";
  const isManager = user?.role === "MANAGER" || user?.role === "ROLE_MANAGER";
  const canModify = isAdmin || isManager;

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await resourceService.getResourceById(id);
        setResource(data);
      } catch (err) {
        console.error("Error fetching resource details:", err);
        setError("Could not load resource details. It may have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this resource?")) return;
    
    setIsDeleting(true);
    try {
      await resourceService.deleteResource(id);
      navigate("/dashboard/manager/resources", { state: { message: "Resource deleted successfully" } });
    } catch (err) {
      setError("Failed to delete resource. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!resource) return;
    
    setIsToggling(true);
    const newStatus = resource.status === "ACTIVE" ? "IN_MAINTENANCE" : "ACTIVE";
    try {
      const updated = await resourceService.updateResourceStatus(id, newStatus);
      setResource(updated);
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update status. Only admins/managers can perform this action.");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading resource details...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 text-red-700 p-8 rounded-xl max-w-lg mx-auto border border-red-100 shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-6">{error || "Resource not found"}</p>
          <Link to="/dashboard/manager/resources" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold">
            Back to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IN_MAINTENANCE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'RETIRED': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'BOOKED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb / Back Navigation */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Resources</span>
      </button>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 ring-1 ring-slate-200/50">
        {/* Header Section */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 flex flex-col justify-end">
          <div className="absolute top-6 right-8 flex space-x-3">
             {canModify && (
               <>
                 <Link 
                   to={`/dashboard/manager/resources/${id}/edit`} 
                   className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center transition"
                 >
                   <Edit className="h-4 w-4 mr-2" /> Edit
                 </Link>
                 <button 
                   onClick={handleDelete}
                   disabled={isDeleting}
                   className="bg-white/20 backdrop-blur-md hover:bg-rose-500/80 text-white px-4 py-2 rounded-lg flex items-center transition disabled:opacity-50"
                 >
                   <Trash2 className="h-4 w-4 mr-2" /> {isDeleting ? "Deleting..." : "Delete"}
                 </button>
               </>
             )}
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              {resource.type}
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{resource.name}</h1>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 p-8 space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <Info className="h-4 w-4 mr-2" /> Description
              </h3>
              <p className="text-slate-700 leading-relaxed text-lg">
                {resource.description || "No description provided for this resource."}
              </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
              <div className="flex items-start">
                <div className="bg-blue-50 p-3 rounded-xl mr-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Location</h4>
                  <p className="text-slate-900 font-semibold text-lg">{resource.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-indigo-50 p-3 rounded-xl mr-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Storage / Capacity</h4>
                  <p className="text-slate-900 font-semibold text-lg">{resource.capacity} units/people</p>
                </div>
              </div>
            </section>
          </div>

          {/* Action/Status Sidebar */}
          <div className="p-8 bg-slate-50/50 space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Current Status</h3>
              <div className={`inline-flex items-center px-4 py-2 rounded-xl border-2 font-bold text-lg ${getStatusColor(resource.status)}`}>
                {resource.status === 'ACTIVE' && <CheckCircle2 className="h-5 w-5 mr-2" />}
                {resource.status === 'IN_MAINTENANCE' && <Clock className="h-5 w-5 mr-2" />}
                {resource.status}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Availability</h3>
              <div className={`p-4 rounded-xl flex items-center font-bold ${resource.available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                <div className={`w-3 h-3 rounded-full mr-3 ${resource.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                {resource.available ? "Ready for Use" : "Currently Occupied"}
              </div>
            </section>

            {canModify && (
              <section className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Management</h3>
                <button 
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                  className="w-full bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-700 p-4 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  <ToggleLeft className="h-5 w-5 mr-3" />
                  <span className="font-bold">
                    {isToggling ? "Updating..." : `Toggle ${resource.status === 'ACTIVE' ? 'to Maintenance' : 'to Active'}`}
                  </span>
                </button>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
