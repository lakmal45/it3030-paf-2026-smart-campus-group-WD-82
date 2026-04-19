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
  Clock,
  ShieldAlert,
  Activity
} from "lucide-react";
import resourceService from "../../services/resourceService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Robust role extraction — handles both string ("ADMIN") and object ({name:"ADMIN"}) formats
  const getRole = () => {
    const r = user?.role;
    if (!r) return "";
    if (typeof r === "string") return r.toUpperCase();
    if (typeof r === "object" && r.name) return r.name.toUpperCase();
    return String(r).toUpperCase();
  };

  const userRole = getRole();
  const isAdmin = localStorage.getItem('role') === 'ADMIN' || userRole === 'ADMIN';
  
  // Strict RBAC: Only ADMIN can modify resources (Add/Edit/Delete/Status)
  const canModify = isAdmin;

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await resourceService.getById(id);
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
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      await resourceService.delete(id);
      showToast("Resource deleted permanently", "success");
      const basePath = "/dashboard/admin";
      navigate(`${basePath}/resources`);
    } catch (error) {
      console.error("Error deleting resource:", error);
      showToast("Failed to delete resource. Please try again.", "error");
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!resource || !isAdmin) return;
    
    setIsToggling(true);
    const newStatus = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      const updated = await resourceService.updateResourceStatus(id, newStatus);
      setResource(updated);
      showToast(`Resource is now ${newStatus.replace(/_/g, ' ')}`, "success");
    } catch (err) {
      console.error("Error toggling status:", err);
      showToast("Failed to update status. unauthorized.", "error");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 sm:h-80 md:h-96 px-4">
        <div className="relative mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-100 rounded-full"></div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-500 font-medium text-sm sm:text-base">Loading resource details...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="bg-red-50 text-red-700 p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl max-w-2xl mx-auto border border-red-100 shadow-xl">
          <ShieldAlert className="mx-auto h-12 w-12 sm:h-16 sm:w-16 mb-4 sm:mb-6 text-red-400" />
          <h2 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3">Resource Unavailable</h2>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base font-medium opacity-80">{error || "The resource you are looking for does not exist."}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-red-700 transition-all font-bold text-sm sm:text-base shadow-lg shadow-red-200"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'IN_MAINTENANCE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OUT_OF_SERVICE': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RETIRED': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'BOOKED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Nav */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-400 hover:text-slate-900 group transition-all text-sm sm:text-base"
      >
        <div className="p-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-100 mr-3 sm:mr-4 group-hover:shadow-md group-hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <span className="font-bold tracking-tight">← CATALOGUE</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] shadow-xl sm:shadow-2xl shadow-slate-200/30 sm:shadow-slate-200/50 overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
        {/* Hero Header */}
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-end p-4 sm:p-6 md:p-8 lg:p-10 overflow-hidden">
          {/* Abstract background décor */}
          <div className="absolute top-0 right-0 -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-blue-500/20 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-12 sm:-ml-16 -mb-12 sm:-mb-16 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-indigo-500/20 rounded-full blur-2xl sm:blur-3xl"></div>
          
          <div className="relative z-10 w-full flex flex-col gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <span className="inline-flex items-center px-2.5 sm:px-4 py-1 sm:py-1.5 bg-blue-500/20 backdrop-blur-md text-blue-100 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-widest border border-blue-500/30">
                <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1.5 sm:mr-2" /> {resource.type}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight">{resource.name}</h1>
              <p className="text-slate-300 sm:text-slate-400 font-medium flex items-start sm:items-center text-sm sm:text-base gap-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 flex-shrink-0 mt-0.5 sm:mt-0" /> 
                <span className="break-words">{resource.location}</span>
              </p>
            </div>
            
            {canModify && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white/5 backdrop-blur-xl p-2 rounded-lg sm:rounded-2xl border border-white/10 shadow-lg sm:shadow-2xl self-start sm:self-auto">
                <Link 
                  to={`/dashboard/admin/resources/${id}/edit`} 
                  className="bg-white text-slate-900 hover:bg-slate-50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center transition-all font-bold text-sm sm:text-base shadow-sm active:scale-95"
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Modify
                </Link>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center transition-all font-bold text-sm sm:text-base active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Main Content (left) */}
          <div className="lg:col-span-8 p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 sm:space-y-10 lg:space-y-12">
            <section>
              <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 sm:mb-6 flex items-center">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-blue-500" /> About this resource
              </h3>
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg lg:text-xl font-medium">
                {resource.description || "Detailed documentation has not been provided for this specific campus asset."}
              </p>
            </section>

            <section className="pt-6 sm:pt-8 lg:pt-10 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
              <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="bg-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-100 flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Max Capacity</h4>
                  <p className="text-slate-900 font-black text-xl sm:text-2xl tracking-tight">{resource.capacity} <span className="text-slate-400 text-xs sm:text-sm font-bold">Persons</span></p>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="bg-emerald-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-100 flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Availability</span>
                  <span className="text-slate-900 font-bold text-sm sm:text-base lg:text-lg leading-tight">{resource.availabilityWindows || "Mon-Fri 8AM-5PM"}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar (right) */}
          <div className="lg:col-span-4 p-4 sm:p-6 md:p-8 lg:p-10 bg-slate-50/30 space-y-6 sm:space-y-8 lg:space-y-10">
            <section>
              <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 sm:mb-6">Status Badge</h3>
              <div className={`flex flex-col p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 space-y-4 ${getStatusColor(resource.status)}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black text-lg sm:text-xl tracking-tighter uppercase">{resource.status.replace(/_/g, ' ')}</span>
                  {resource.status === 'ACTIVE' ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" /> : <Clock className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />}
                </div>
                <p className="text-xs sm:text-sm font-bold opacity-80 leading-snug">
                  {resource.status === 'ACTIVE' 
                    ? "Currently operational and performing as expected." 
                    : "Suspended or under review by administration."}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 sm:mb-6">Availability</h3>
              {resource.available && resource.status === 'ACTIVE' ? (
                <button
                  onClick={() => navigate("/dashboard/user/create-booking", { state: { resourceName: resource.name } })}
                  className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-base sm:text-lg transition-all gap-3 bg-emerald-600 text-white shadow-lg sm:shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95"
                >
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6" /> BOOK THIS RESOURCE
                </button>
              ) : (
                <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center font-black text-base sm:text-lg transition-all gap-3 ${resource.available ? 'bg-emerald-600/50 text-white/80' : 'bg-slate-200 text-slate-500'}`}>
                  {resource.available ? (
                    <div className="flex items-center w-full gap-3">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                          resource.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${resource.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                          {resource.status}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center w-full gap-3">
                      <div className="bg-slate-300 p-2 rounded-full flex-shrink-0">
                        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
                      </div>
                      <span className="text-sm sm:text-base">BOOKED / BUSY</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {canModify && isAdmin && (
              <section className="pt-6 sm:pt-8 border-t border-slate-200 space-y-4">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2">Admin Controls</h3>
                <button 
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                  className="group w-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Toggle to ${resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE'}`}
                >
                  <ToggleLeft className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${resource.status === 'ACTIVE' ? 'text-slate-400' : 'text-blue-600'}`} />
                  <span className={`font-black text-sm sm:text-base tracking-tight ${resource.status === 'ACTIVE' ? 'text-slate-700' : 'text-blue-700'}`}>
                    {isToggling ? "PROCESSING..." : `TOGGLE TO ${resource.status === 'ACTIVE' ? 'OUT OF SERVICE' : 'ACTIVE'}`}
                  </span>
                </button>
              </section>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Resource?"
        message={`This will permanently delete ${resource.name} and all its associated booking history. This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Permanently Delete"}
      />
    </div>
  );
};

export default ResourceDetailPage;
