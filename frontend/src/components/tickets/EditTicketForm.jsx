import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ticketService from "../../services/ticketService";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

const CATEGORIES = ["ELECTRICAL", "PLUMBING", "EQUIPMENT", "STRUCTURAL", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const EditTicketForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: "",
    category: "OTHER",
    description: "",
    priority: "LOW",
    preferredContact: "",
    resourceId: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await ticketService.getById(id);
        // Only allow editing if OPEN (security is also enforced on backend)
        if (data.status !== "OPEN" && data.role !== "ADMIN") {
            // Note: role might not be in ticket data directly as a string, 
            // but the backend will block it. 
            // We should ideally check the user role here too.
        }
        setFormData({
          location: data.location || "",
          category: data.category || "OTHER",
          description: data.description || "",
          priority: data.priority || "LOW",
          preferredContact: data.preferredContact || "",
          resourceId: data.resourceId || "",
        });
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", message: "Failed to load ticket details." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      await ticketService.update(id, formData);
      setStatus({ type: "success", message: "Ticket updated successfully." });
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || err.response?.data?.error || "Failed to update ticket. Please try again." 
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading ticket...</div>;

  return (
    <div className="max-w-3xl mx-auto py-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Ticket #{id}</h1>
        <p className="text-slate-500 mt-2">Update the details of your service request.</p>
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
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Location / Room <span className="text-rose-500">*</span></label>
            <input
              required
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
            />
          </div>

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

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Issue Description <span className="text-rose-500">*</span></label>
            <textarea
              required
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 resize-y"
            ></textarea>
          </div>

          <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Contact</label>
                <input
                  type="text"
                  name="preferredContact"
                  value={formData.preferredContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Resource ID</label>
                <input
                  type="text"
                  name="resourceId"
                  value={formData.resourceId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
             </div>
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
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center min-w-[140px]"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTicketForm;
