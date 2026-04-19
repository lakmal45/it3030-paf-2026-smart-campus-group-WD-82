import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bookingService from "../../services/bookingService";
import resourceService from "../../services/resourceService";

const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({ 
    resource: location.state?.resourceName || "", 
    date: "", 
    startTime: "", 
    endTime: "", 
    reason: "" 
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await resourceService.getAllResources();
        setResources(data.filter(r => r.status === 'ACTIVE' && r.available));
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setIsLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resourceParam = params.get("resource");
    if (resourceParam) {
      setFormData(prev => ({ ...prev, resource: resourceParam }));
    }
  }, [location]);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.resource) newErrors.resource = "Resource is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.startTime) newErrors.startTime = "Start time is required.";
    if (!formData.endTime) newErrors.endTime = "End time is required.";
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "End time must be after start time.";
    }
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await bookingService.createBooking(formData);
      navigate("/dashboard/user/bookings");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create booking. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Booking</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {submitError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resource</label>
            <select
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${errors.resource ? 'border-red-500 text-red-600' : 'border-slate-200 text-slate-600'}`}
              value={formData.resource}
              onChange={(e) => { setFormData({ ...formData, resource: e.target.value }); if (errors.resource) setErrors({ ...errors, resource: '' }); }}
              disabled={isLoadingResources}
            >
              <option value="">{isLoadingResources ? "Loading..." : "Select a resource to book"}</option>
              {resources.map(r => (
                <option key={r.id} value={r.name}>{r.name} ({r.location})</option>
              ))}
            </select>
            {errors.resource && <p className="text-red-500 text-xs mt-1">{errors.resource}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${errors.date ? 'border-red-500 text-red-600' : 'border-slate-200 text-slate-600'}`}
              value={formData.date}
              onChange={(e) => { setFormData({ ...formData, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }); }}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${errors.startTime ? 'border-red-500 text-red-600' : 'border-slate-200 text-slate-600'}`}
                value={formData.startTime}
                onChange={(e) => { setFormData({ ...formData, startTime: e.target.value }); if (errors.startTime) setErrors({ ...errors, startTime: '' }); if (errors.endTime && errors.endTime.includes('after')) setErrors({ ...errors, endTime: '' }); }}
              />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${errors.endTime ? 'border-red-500 text-red-600' : 'border-slate-200 text-slate-600'}`}
                value={formData.endTime}
                onChange={(e) => { setFormData({ ...formData, endTime: e.target.value }); if (errors.endTime) setErrors({ ...errors, endTime: '' }); }}
              />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Booking</label>
            <textarea
              rows="4"
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${errors.reason ? 'border-red-500 text-red-600' : 'border-slate-200 text-slate-600'}`}
              placeholder="Brief description..."
              value={formData.reason}
              onChange={(e) => { setFormData({ ...formData, reason: e.target.value }); if (errors.reason) setErrors({ ...errors, reason: '' }); }}
            ></textarea>
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;

