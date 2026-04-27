import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ticketService from "../../services/ticketService";
import resourceService from "../../services/resourceService";
import ImageUpload from "./ImageUpload";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const CATEGORIES = ["ELECTRICAL", "PLUMBING", "EQUIPMENT", "STRUCTURAL", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const CreateTicketForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: "",
    category: "OTHER",
    description: "",
    priority: "LOW",
    preferredContact: "",
    resourceId: "",
  });
  const [files, setFiles] = useState([]);
  const [resources, setResources] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" }); // type: 'error' | 'success'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search for resources
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setResources([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await resourceService.getFilteredResources({ name: searchTerm });
        setResources(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResourceChange = (e) => {
    const resId = e.target.value;
    if (!resId) {
      setFormData(prev => ({ ...prev, location: "", resourceId: "" }));
      return;
    }
    const selectedRes = resources.find(r => r.id.toString() === resId);
    if (selectedRes) {
      setFormData(prev => ({
        ...prev,
        location: `${selectedRes.name} - ${selectedRes.location}`,
        resourceId: selectedRes.id.toString()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    if (!formData.resourceId) {
      setStatus({ type: "error", message: "Please search and select a location/room before submitting." });
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Create ticket
      const { data } = await ticketService.create(formData);
      const createdTicketId = data.id;

      // 2. Upload images in parallel if any
      if (files.length > 0) {
        // Since the backend handles 'files' as a list, we can still use the single uploadImages call,
        // but if we were using multiple individual calls, we'd use Promise.all.
        // For now, let's at least ensure we don't block UI unnecessarily.
        await ticketService.uploadImages(createdTicketId, files);
      }

      setStatus({ type: "success", message: `Ticket #${createdTicketId} submitted successfully.` });
      
      // Redirect after brief delay
      setTimeout(() => {
        navigate("/dashboard/user/tickets");
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || err.response?.data?.error || "An error occurred. Please try again." 
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Report an Incident</h1>
        <p className="text-slate-500 mt-2">Submit a maintenance or support ticket to the campus facilities team.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${
          status.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {status.type === 'error' ? <AlertCircle className="shrink-0 mt-0.5" size={18} /> : <CheckCircle2 className="shrink-0 mt-0.5" size={18} />}
          <div className="font-medium text-sm">{status.message}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Location / Resource Select */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Location / Room <span className="text-rose-500">*</span></label>
            
            {formData.resourceId ? (
              /* Selected Resource View */
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 text-sm">{formData.location}</h4>
                    <p className="text-xs text-indigo-600">Resource ID: {formData.resourceId}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, location: "", resourceId: "" }));
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Change Location
                </button>
              </div>
            ) : (
              /* Search & Select View */
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search room (e.g. Lab 101, Office...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3.5">
                      <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <select
                  required
                  name="resourceId"
                  value={formData.resourceId}
                  onChange={handleResourceChange}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="">{searchTerm ? (resources.length > 0 ? "Select from results" : "No results found") : "Start typing to search"}</option>
                  {resources.map(res => (
                    <option key={res.id} value={res.id}>
                      {res.name} ({res.location})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <p className="mt-2 text-[10px] text-slate-400 font-medium italic">
              * Official campus locations must be selected from the resource catalogue.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category <span className="text-rose-500">*</span></label>
            <select
              required
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Priority <span className="text-rose-500">*</span></label>
            <select
              required
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
            >
              {PRIORITIES.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Issue Description <span className="text-rose-500">*</span></label>
            <textarea
              required
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please describe the issue in detail..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 resize-y"
            ></textarea>
          </div>

          {/* Optional Fields Container */}
          <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Contact <span className="font-normal text-slate-400">(Optional)</span></label>
                <input
                  type="text"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  placeholder="e.g. Phone number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
             </div>
          </div>

          {/* Image Upload */}
          <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
             <label className="block text-sm font-bold text-slate-700 mb-2">Attachments <span className="font-normal text-slate-400">(Optional, Max 3)</span></label>
             <ImageUpload files={files} setFiles={setFiles} maxFiles={3} />
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketForm;
