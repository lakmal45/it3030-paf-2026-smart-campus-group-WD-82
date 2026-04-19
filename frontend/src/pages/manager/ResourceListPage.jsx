import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import resourceService from "../../services/resourceService";
import ResourceFilters from "../../components/resources/ResourceFilters";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { 
  Plus, 
  Table, 
  LayoutGrid, 
  Eye, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Building2,
  FilterX,
  MapPin,
  ToggleRight,
  Calendar
} from "lucide-react";

const ResourceListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();
  const { showToast } = useToast();
  
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [viewMode, setViewMode] = useState("table");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  const isAdmin = 
    role === 'ADMIN' || 
    role === 'ROLE_ADMIN';

  // Determine base dashboard path based on role
  const getDashboardPath = () => {
    if (isAdmin) return "/dashboard/admin";
    if (role === "MANAGER") return "/dashboard/manager";
    return "/dashboard/user";
  };

  const dashboardPath = getDashboardPath();

  // Strict RBAC: Only ADMIN can modify resources (Add/Edit/Delete/Status)
  const canModify = isAdmin;

  const fetchResources = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      // Use standard getAll if no filters are applied to avoid search parameter edge cases
      const data = Object.keys(filters).length === 0 
        ? await resourceService.getAllResources()
        : await resourceService.getFilteredResources(filters);
      
      setResources(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources. Please try again.");
      showToast("Could not retrieve resources", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchResources();
    if (successMessage) {
      showToast(successMessage);
      setSuccessMessage(null);
    }
  }, [successMessage, showToast, fetchResources]);

  const handleDeleteClick = (e, resource) => {
    e.stopPropagation();
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    try {
      await resourceService.delete(resourceToDelete.id);
      showToast("Resource removed from catalogue", "success");
      fetchResources();
    } catch (err) {
      console.error("Delete error:", err);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      showToast(`Deletion failed: ${msg}`, "error");
    } finally {
      setShowDeleteModal(false);
      setResourceToDelete(null);
    }
  };
  
  const handleStatusToggle = async (e, resource) => {
    e.stopPropagation();
    const newStatus = resource.status === "ACTIVE" ? "OUT_OF_SERVICE" : "ACTIVE";
    try {
      await resourceService.updateResourceStatus(resource.id, newStatus);
      showToast(`Status updated to ${newStatus.replace(/_/g, ' ')}`, "success");
      fetchResources();
    } catch (err) {
      console.error("Status update error:", err);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      showToast(`Toggle failed: ${msg}`, "error");
    }
  };

  const handleRowClick = (id) => {
    navigate(`${dashboardPath}/resources/${id}`);
  };

  const handleEditClick = (e, id) => {
    e.stopPropagation();
    navigate(`${dashboardPath}/resources/${id}/edit`);
  };

  const handleAddClick = () => {
    navigate(`${dashboardPath}/resources/new`);
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return <span className="px-3 py-1 text-[10px] font-black rounded-full bg-emerald-500/10 text-emerald-600 flex items-center w-fit border border-emerald-500/20 uppercase tracking-widest"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</span>;
      case 'IN_MAINTENANCE':
        return <span className="px-3 py-1 text-[10px] font-black rounded-full bg-amber-500/10 text-amber-600 flex items-center w-fit border border-amber-500/20 uppercase tracking-widest"><Clock className="h-3 w-3 mr-1" /> Maintenance</span>;
      case 'OUT_OF_SERVICE':
        return <span className="px-3 py-1 text-[10px] font-black rounded-full bg-rose-500/10 text-rose-600 flex items-center w-fit border border-rose-500/20 uppercase tracking-widest"><AlertTriangle className="h-3 w-3 mr-1" /> Out of Service</span>;
      case 'RETIRED':
        return <span className="px-3 py-1 text-[10px] font-black rounded-full bg-slate-500/10 text-slate-600 flex items-center w-fit border border-slate-500/20 uppercase tracking-widest"><AlertTriangle className="h-3 w-3 mr-1" /> Retired</span>;
      default:
        return <span className="px-3 py-1 text-[10px] font-black rounded-full bg-slate-100 text-slate-800 uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8 lg:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
            <div className="p-2 bg-blue-600 rounded-lg sm:rounded-xl shadow-lg shadow-blue-100 sm:shadow-blue-200">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">Resources</h1>
          </div>
          <p className="text-slate-500 font-medium text-xs sm:text-sm lg:text-base max-w-md">Browse and manage the campus infrastructure, equipment, and learning spaces.</p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 w-full md:w-auto">
          <div className="hidden sm:flex bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Table View"
            >
              <Table className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === "card" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              title="Card View"
            >
              <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          {canModify && (
            <button
              onClick={handleAddClick}
              className="flex-1 md:flex-none bg-slate-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-2xl hover:bg-black active:scale-[0.98] transition-all shadow-lg sm:shadow-xl shadow-slate-200 font-black flex items-center justify-center space-x-1.5 sm:space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">NEW ASSET</span>
              <span className="sm:hidden">ADD</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm">
        <ResourceFilters onSearch={fetchResources} />
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 sm:h-80 space-y-4 px-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-100 rounded-full"></div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 font-extrabold tracking-widest text-[10px] sm:text-xs uppercase">Syncing Cloud Data</p>
        </div>
      ) : error ? (
        <div className="py-12 sm:py-16 md:py-24 text-center bg-rose-50 rounded-xl sm:rounded-2xl md:rounded-[3rem] border border-rose-100 shadow-sm border-dashed px-4">
          <div className="bg-rose-100 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-rose-500" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-rose-900 tracking-tight mb-2">Fetch Error</h3>
          <p className="text-rose-600/80 font-medium text-xs sm:text-sm max-w-sm mx-auto mb-4 sm:mb-6">{error}</p>
          <button 
            onClick={() => fetchResources()}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-rose-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-2xl hover:bg-rose-700 transition shadow-lg shadow-rose-200 active:scale-95"
          >
            Retry Request
          </button>
        </div>
      ) : resources.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {resources.map((resource) => (
              <div 
                key={resource.id} 
                onClick={() => handleRowClick(resource.id)}
                className="group bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer flex flex-col h-full relative"
              >
                <div className="mb-6 flex justify-between items-start">
                   <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                      <Building2 className={`h-6 w-6 transition-colors ${resource.available ? 'text-emerald-500' : 'text-slate-400'}`} />
                   </div>
                   {getStatusBadge(resource.status)}
                </div>

                <div className="flex-1 space-y-2 mb-8">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{resource.name}</h3>
                  <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <MapPin className="h-3 w-3 mr-1.5" /> {resource.location}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Capacity</p>
                    <p className="text-slate-700 font-black">{resource.capacity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Class</p>
                    <p className="text-slate-700 font-black truncate">{resource.type}</p>
                  </div>
                </div>

                {!isAdmin && resource.status === 'ACTIVE' && resource.available && (
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/dashboard/user/create-booking", { state: { resourceName: resource.name } });
                      }}
                      className="px-6 py-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all active:scale-95 text-xs flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" /> BOOK NOW
                    </button>
                  </div>
                )}

                {canModify && (
                  <div className="flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Compact Status Toggle for cards */}
                    <button
                      onClick={(e) => handleStatusToggle(e, resource)}
                      className={`p-2 rounded-lg transition-colors ${resource.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}
                      title="Toggle Status"
                    >
                      <ToggleRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleEditClick(e, resource.id)}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                      title="Edit Resource"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, resource)}
                      className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                      title="Delete Resource"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Identity</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logistics</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current State</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Availability</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {resources.map((resource) => (
                  <tr 
                    key={resource.id} 
                    onClick={() => handleRowClick(resource.id)}
                    className="hover:bg-slate-50/80 group cursor-pointer transition-colors"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                          <Building2 className={`h-5 w-5 ${resource.available ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{resource.name}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-600">{resource.location}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity: {resource.capacity}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {getStatusBadge(resource.status)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {resource.available ? (
                        <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 w-fit">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                          Operational
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 w-fit">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                          Reserved
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right space-x-2">
                       <button
                        onClick={(e) => { e.stopPropagation(); handleRowClick(resource.id); }}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                        title="view"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {!isAdmin && resource.status === 'ACTIVE' && resource.available && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate("/dashboard/user/create-booking", { state: { resourceName: resource.name } }); 
                          }}
                          className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                          title="book now"
                        >
                          <Calendar className="h-5 w-5" />
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => handleEditClick(e, resource.id)}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                            title="edit"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          
                          <div className="inline-flex items-center align-middle mx-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleStatusToggle(e, resource)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${resource.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                              title={resource.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${resource.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          <button
                            onClick={(e) => handleDeleteClick(e, resource)}
                            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                            title="delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )
      ) : (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm border-dashed">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FilterX className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Null Result Set</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">None of the campus resources match your current filtering criteria. Try expanding your search horizons.</p>
        </div>
      )}

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setResourceToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Resource?"
        message={`Are you sure you want to remove ${resourceToDelete?.name}? This entry will be permanently erased from the campus catalogue.`}
      />
    </div>
  );
};

export default ResourceListPage;
