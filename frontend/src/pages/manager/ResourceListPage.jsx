import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import resourceService from "../../services/resourceService";
import ResourceFilters from "../../components/resources/ResourceFilters";
import { useAuth } from "../../context/AuthContext";
import { Plus, Table, LayoutGrid, Eye, Edit, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const ResourceListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [viewMode, setViewMode] = useState("table");

  // Determine base dashboard path based on role
  const getDashboardPath = () => {
    const role = user?.role?.toLowerCase();
    if (role?.includes("admin")) return "/dashboard/admin";
    if (role?.includes("manager")) return "/dashboard/manager";
    return "/dashboard/user";
  };

  const dashboardPath = getDashboardPath();
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";
  const isManager = user?.role === "MANAGER" || user?.role === "ROLE_MANAGER";
  const canModify = isAdmin || isManager;

  useEffect(() => {
    fetchResources();
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchResources = async (filters = {}) => {
    setIsLoading(true);
    try {
      const data = await resourceService.getFilteredResources(filters);
      setResources(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent navigation to detail page
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await resourceService.delete(id);
        setSuccessMessage("Resource deleted successfully");
        fetchResources();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete resource.");
      }
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
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center w-fit"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</span>;
      case 'IN_MAINTENANCE':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 flex items-center w-fit"><Clock className="h-3 w-3 mr-1" /> Maintenance</span>;
      case 'RETIRED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 flex items-center w-fit"><AlertTriangle className="h-3 w-3 mr-1" /> Retired</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Resource Catalogue</h1>
          <p className="text-slate-500 font-medium">Manage and monitor campus rooms, labs, and equipment.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="bg-slate-100 p-1.5 rounded-xl flex space-x-1 shadow-inner border border-slate-200/50">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title="Table View"
            >
              <Table className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              title="Card View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
          {canModify && (
            <button
              onClick={handleAddClick}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 font-bold flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center animate-in fade-in zoom-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      <ResourceFilters onSearch={fetchResources} />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.length > 0 ? (
            resources.map((resource) => (
              <div 
                key={resource.id} 
                onClick={() => handleRowClick(resource.id)}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Eye className="h-5 w-5 text-blue-500" />
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{resource.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">{resource.type}</p>
                  </div>
                  {getStatusBadge(resource.status)}
                </div>
                
                <p className="text-sm text-slate-600 mb-6 line-clamp-2 h-10 leading-relaxed">{resource.description || "No description provided."}</p>
                
                <div className="space-y-4 mb-6 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-semibold flex items-center">Location</span>
                    <span className="font-bold text-slate-800">{resource.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-semibold flex items-center">Capacity</span>
                    <span className="font-bold text-slate-800">{resource.capacity}</span>
                  </div>
                </div>
                
                {canModify && (
                  <div className="pt-4 border-t border-dashed border-slate-200 flex justify-end space-x-6">
                    <button
                      onClick={(e) => handleEditClick(e, resource.id)}
                      className="text-slate-500 hover:text-blue-600 text-sm font-bold flex items-center transition"
                    >
                      <Edit className="h-4 w-4 mr-1.5" /> Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, resource.id)}
                        className="text-slate-500 hover:text-rose-600 text-sm font-bold flex items-center transition"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No resources found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest leading-4">Resource Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest leading-4">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest leading-4">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest leading-4">Availability</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest leading-4">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <tr 
                      key={resource.id} 
                      onClick={() => handleRowClick(resource.id)}
                      className="hover:bg-slate-50 group cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{resource.name}</div>
                        <div className="text-xs font-medium text-slate-400 mt-1">{resource.type}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-xs text-slate-600 font-semibold">{resource.location}</div>
                          <div className="flex items-center text-xs text-slate-600 font-semibold">Capacity: {resource.capacity}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getStatusBadge(resource.status)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {resource.available ? (
                          <div className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                            Available
                          </div>
                        ) : (
                          <div className="flex items-center text-rose-600 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2"></span>
                            Occupied
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRowClick(resource.id); }}
                          className="inline-flex p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {canModify && (
                          <button
                            onClick={(e) => handleEditClick(e, resource.id)}
                            className="inline-flex p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={(e) => handleDelete(e, resource.id)}
                            className="inline-flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-slate-500 italic font-medium">
                       No resources match your current selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceListPage;
