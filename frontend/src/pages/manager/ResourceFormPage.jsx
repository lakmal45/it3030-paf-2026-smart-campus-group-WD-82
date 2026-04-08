import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Building2, 
  Info, 
  MapPin, 
  Users,
  AlertCircle
} from "lucide-react";
import resourceService from "../../services/resourceService";

const ResourceFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    type: "Room",
    location: "",
    capacity: 1,
    available: true,
    status: "ACTIVE",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchResource = async () => {
        try {
          const data = await resourceService.getResourceById(id);
          setFormData({
            name: data.name || "",
            type: data.type || "Room",
            location: data.location || "",
            capacity: data.capacity || 1,
            available: data.available ?? true,
            status: data.status || "ACTIVE",
            description: data.description || "",
          });
        } catch (err) {
          console.error("Error loading resource:", err);
          setServerError("Failed to load resource data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchResource();
    }
  }, [id, isEditMode]);

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
    if (formData.capacity < 1) newErrors.capacity = "Capacity must be at least 1";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setServerError("");
    try {
      if (isEditMode) {
        await resourceService.updateResource(id, formData);
      } else {
        await resourceService.createResource(formData);
      }
      navigate("/dashboard/manager/resources", { 
        state: { message: `Resource ${isEditMode ? "updated" : "created"} successfully!` } 
      });
    } catch (err) {
      console.error("Save error:", err);
      setServerError(err.response?.data?.message || "Failed to save resource. Check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? "Edit Resource" : "Register New Resource"}
          </h1>
        </div>
      </div>

      {serverError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center animate-in fade-in zoom-in">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" /> General Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Resource Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Advanced Physics Lab"
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-4 focus:ring-blue-100 focus:outline-none ${
                    errors.name ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1.5 font-bold">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Detailed Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the facilities, equipment available, or specific use cases..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-indigo-600" /> Location & Capacity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Main Block, Room 102"
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-4 focus:ring-blue-100 focus:outline-none ${
                    errors.location ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {errors.location && <p className="text-rose-500 text-xs mt-1.5 font-bold">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Capacity (Max Persons) *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-4 focus:ring-blue-100 focus:outline-none ${
                    errors.capacity ? "border-rose-300 bg-rose-50" : "border-slate-200 focus:border-blue-500"
                  }`}
                />
                {errors.capacity && <p className="text-rose-500 text-xs mt-1.5 font-bold">{errors.capacity}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Info className="h-5 w-5 mr-2 text-emerald-600" /> Configuration
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Resource Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')" }}
                >
                  <option value="Room">Room</option>
                  <option value="Lab">Lab</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Lecture Hall">Lecture Hall</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Initial Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')" }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="IN_MAINTENANCE">In Maintenance</option>
                  <option value="UNDER_REPAIR">Under Repair</option>
                  <option value="BOOKED">Booked</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.available ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.available ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-slate-700 select-none group-hover:text-slate-900 transition-colors">
                    Available for Booking
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-center font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? "Processing..." : isEditMode ? "Save Changes" : "Create Resource"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-4 rounded-xl flex items-center justify-center font-bold transition-all"
            >
              <X className="h-5 w-5 mr-2" /> Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResourceFormPage;
