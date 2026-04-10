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

  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";
  const isManager = user?.role === "MANAGER" || user?.role === "ROLE_MANAGER";
  const isUser = user?.role === "USER" || user?.role === "ROLE_USER"; 
  
  // Broadening permissions to unblock Member 1's development
  const canModify = isAdmin || isManager || isUser;

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
      const basePath = isAdmin ? "/dashboard/admin" : "/dashboard/manager";
      navigate(`${basePath}/resources`);
    } catch (err) {
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
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Fetching asset data...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 text-red-700 p-12 rounded-3xl max-w-2xl mx-auto border border-red-100 shadow-xl">
          <ShieldAlert className="mx-auto h-16 w-16 mb-6 text-red-400" />
          <h2 className="text-2xl font-black mb-3">Resource Unavailable</h2>
          <p className="mb-8 text-lg font-medium opacity-80">{error || "The resource you are looking for does not exist."}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-red-600 text-white px-8 py-3 rounded-2xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200"
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
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Nav */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-400 hover:text-slate-900 group transition-all"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 mr-4 group-hover:shadow-md group-hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-5 w-5 " />
        </div>
        <span className="font-bold tracking-tight">CATAOLGE DIRECTORY</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
        {/* Hero Header */}
        <div className="relative h-64 bg-slate-900 flex items-end p-10 overflow-hidden">
          {/* Abstract background décor */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center px-4 py-1.5 bg-blue-500/20 backdrop-blur-md text-blue-200 text-xs font-black rounded-full uppercase tracking-widest border border-blue-500/30">
                <Activity className="h-3 w-3 mr-2" /> {resource.type}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{resource.name}</h1>
              <p className="text-slate-400 font-medium flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2 text-blue-400" /> {resource.location}
              </p>
            </div>
            
            {canModify && (
              <div className="flex bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
                <Link 
                  to={`${isAdmin ? '/dashboard/admin' : '/dashboard/manager'}/resources/${id}/edit`} 
                  className="bg-white text-slate-900 hover:bg-slate-50 px-6 py-3 rounded-xl flex items-center transition-all font-bold shadow-sm active:scale-95"
                >
                  <Edit className="h-4 w-4 mr-2" /> Modify
                </Link>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="ml-2 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white px-6 py-3 rounded-xl flex items-center transition-all font-bold active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Main Content (left) */}
          <div className="lg:col-span-8 p-10 space-y-12">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                <Info className="h-4 w-4 mr-3 text-blue-500" /> About this resource
              </h3>
              <p className="text-slate-600 leading-relaxed text-xl font-medium">
                {resource.description || "Detailed documentation has not been provided for this specific campus asset."}
              </p>
            </section>

            <section className="pt-10 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center">
                <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100 mr-5 flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Max Capacity</h4>
                  <p className="text-slate-900 font-black text-2xl tracking-tight">{resource.capacity} <span className="text-slate-400 text-sm font-bold">Persons</span></p>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center">
                <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-100 mr-5 flex-shrink-0">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Operating Hours</h4>
                  <p className="text-slate-900 font-bold text-lg leading-tight">{resource.availabilityWindows || "24/7 Availability"}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar (right) */}
          <div className="lg:col-span-4 p-10 bg-slate-50/30 space-y-10">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Status Overlay</h3>
              <div className={`flex flex-col p-6 rounded-3xl border-2 space-y-4 ${getStatusColor(resource.status)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xl tracking-tighter uppercase">{resource.status.replace(/_/g, ' ')}</span>
                  {resource.status === 'ACTIVE' ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                </div>
                <p className="text-sm font-bold opacity-80 leading-snug">
                  {resource.status === 'ACTIVE' 
                    ? "Currently operational and performing as expected." 
                    : "Suspended or under review by administration."}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Availability</h3>
              <div className={`p-6 rounded-3xl flex items-center font-black text-lg transition-all ${resource.available ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'bg-slate-200 text-slate-500'}`}>
                {resource.available ? (
                  <div className="flex items-center w-full">
                    <div className="bg-white/20 p-2 rounded-full mr-4">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                    </div>
                    READY FOR USE
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <div className="bg-slate-300 p-2 rounded-full mr-4">
                      <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
                    </div>
                    BOOKED / BUSY
                  </div>
                )}
              </div>
            </section>

            {canModify && (
              <section className="pt-8 border-t border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Admin Overrides</h3>
                <button 
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                  className="group w-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 p-5 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <ToggleLeft className={`h-6 w-6 mr-3 transition-colors ${resource.status === 'ACTIVE' ? 'text-slate-400' : 'text-blue-600'}`} />
                  <span className={`font-black tracking-tight ${resource.status === 'ACTIVE' ? 'text-slate-700' : 'text-blue-700'}`}>
                    {isToggling ? "PROCESSING..." : `SET TO ${resource.status === 'ACTIVE' ? 'OUT OF SERVICE' : 'ACTIVE'}`}
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
