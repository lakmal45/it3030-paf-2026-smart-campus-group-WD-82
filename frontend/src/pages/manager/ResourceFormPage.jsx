import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Building2, 
  Info, 
  MapPin, 
  Clock,
  AlertCircle,
  FileText
} from "lucide-react";
import resourceService from "../../services/resourceService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ResourceFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    type: "Room",
    location: "",
    capacity: 1,
    available: true,
    status: "ACTIVE",
    description: "",
    availabilityWindows: "",
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const normalizedRole = user?.role?.toUpperCase() || "";
  const isAdmin = normalizedRole.includes("ADMIN");
  const isAuthorized = isAdmin;

  useEffect(() => {
    if (!isAuthorized && !isLoading) {
      showToast("Access Denied: Management privileges required", "error");
      navigate("/dashboard");
      return;
    }

    if (isEditMode) {
      const fetchResource = async () => {
        try {
          const data = await resourceService.getById(id);
          setFormData({
            name: data.name || "",
            type: data.type || "Room",
            location: data.location || "",
            capacity: data.capacity || 1,
            available: data.available ?? true,
            status: data.status || "ACTIVE",
            description: data.description || "",
            availabilityWindows: data.availabilityWindows || "",
          });
        } catch (err) {
          console.error("Error loading resource:", err);
          showToast("Failed to load resource data", "error");
          navigate(-1);
        } finally {
          setIsLoading(false);
        }
      };
      fetchResource();
    }
  }, [id, isEditMode, navigate, showToast, isAuthorized, isLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear field error
    if (errors[name]) {
      setErrors(prev => {
        const next = {...prev};
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Resource name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (parseInt(formData.capacity) <= 0) newErrors.capacity = "Capacity must be a positive number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please correct the errors in the form", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        await resourceService.update(id, formData);
        showToast("Resource updated successfully!");
      } else {
        await resourceService.create(formData);
        showToast("Resource created successfully!");
      }
      
      // Navigate back to list based on role
      let basePath = "/dashboard/user";
      if (isAdmin) basePath = "/dashboard/admin";
      else if (isManager) basePath = "/dashboard/manager";
      
      navigate(`${basePath}/resources`);
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.response?.data?.message || "Failed to save resource. Check your inputs.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 sm:h-80 md:h-96 px-4">
        <div className="relative mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-100 rounded-full"></div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-gray-500 font-medium text-sm sm:text-base">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 sm:p-2.5 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-lg sm:rounded-xl transition-all active:scale-95 group flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? "Modify Resource" : "Register Resource"}
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">Complete the details below to {isEditMode ? "update" : "add"} a campus asset.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Side: Major Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* General Info */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" /> General Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Resource Title *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Computing Lab 01"
                  className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border transition-all focus:ring-4 focus:ring-blue-100 focus:outline-none font-medium text-sm ${
                    errors.name ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 focus:border-blue-500 text-slate-900"
                  }`}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="h-3 w-3 mr-1"/> {errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Provide technical specifications, equipment listed, or usage rules..."
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none text-slate-900 font-medium leading-relaxed text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 flex-shrink-0" /> Logistics & Capacity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Physical Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Block A, Floor 2"
                  className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border transition-all focus:ring-4 focus:ring-blue-100 focus:outline-none font-medium text-sm ${
                    errors.location ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 focus:border-blue-500 text-slate-900"
                  }`}
                />
                {errors.location && <p className="text-rose-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="h-3 w-3 mr-1"/> {errors.location}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Maximum Capacity *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border transition-all focus:ring-4 focus:ring-blue-100 focus:outline-none font-bold text-sm lg:text-base ${
                      errors.capacity ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 focus:border-blue-500 text-slate-900"
                    }`}
                  />
                  <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] uppercase tracking-widest pointer-events-none">Units</div>
                </div>
                {errors.capacity && <p className="text-rose-500 text-xs mt-2 font-bold flex items-center"><AlertCircle className="h-3 w-3 mr-1"/> {errors.capacity}</p>}
              </div>
            </div>
          </div>

          {/* Availability Windows */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 flex-shrink-0" /> Operating Schedule
            </h2>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Availability Windows</label>
              <input
                type="text"
                name="availabilityWindows"
                value={formData.availabilityWindows}
                onChange={handleChange}
                placeholder="e.g. Mon-Fri: 08:00 AM - 08:00 PM"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none text-slate-900 font-medium text-sm"
              />
              <p className="mt-2 text-xs text-slate-400 font-medium italic">Define when this resource is open for general use.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Sidebar */}
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
              <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" /> Attributes
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Category</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none appearance-none bg-no-repeat bg-[right_1.25rem_center] font-bold text-slate-900 text-sm"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')" }}
                >
                  <option value="Room">Lecture Room</option>
                  <option value="Lab">Scientific Lab</option>
                  <option value="Equipment">Tangible Equipment</option>
                  <option value="Lecture Hall">Theatre / Hall</option>
                  <option value="Auditorium">Auditorium</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Operational Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none appearance-none bg-no-repeat bg-[right_1.25rem_center] font-bold text-slate-900 text-sm"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')" }}
                >
                  <option value="ACTIVE text-emerald-600">Active</option>
                  <option value="IN_MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                  <option value="UNDER_REPAIR">Under Repair</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              <div className="pt-3 sm:pt-4 p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 sm:w-14 h-6 sm:h-7 rounded-full transition-all duration-300 ${formData.available ? 'bg-blue-600 shadow-md shadow-blue-100' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 sm:w-5 h-4 sm:h-5 rounded-full shadow-sm transition-transform duration-300 ${formData.available ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="ml-3 sm:ml-4 text-xs sm:text-sm font-bold text-slate-700 select-none transition-colors">
                    Available for Bookings
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 sm:space-y-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {isEditMode ? "Update Resource" : "Create Asset"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm sm:text-base transition-all active:scale-95"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Dismiss
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResourceFormPage;
