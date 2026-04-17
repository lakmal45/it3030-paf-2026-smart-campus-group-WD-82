import React, { useState, useEffect } from "react";
import bookingService from "../../services/bookingService";
import { 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Filter
} from "lucide-react";

/**
 * AllBookings Component
 * Management interface for Admins to view, update, and delete all campus reservations.
 */
const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Editing state
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({ 
    date: "", 
    startTime: "", 
    endTime: "", 
    resource: "", 
    status: "" 
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Unable to retrieve booking data. Please check if the backend service is reachable.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;
    try {
      await bookingService.deleteBooking(id);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete booking:", err);
      alert("Failed to delete booking.");
    }
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking.id);
    setEditForm({
      date: booking.date,
      startTime: booking.startTime.substring(0, 5),
      endTime: booking.endTime.substring(0, 5),
      resource: booking.resource,
      status: booking.status,
    });
  };

  const cancelEdit = () => {
    setEditingBooking(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await bookingService.updateBooking(editingBooking, editForm);
      setBookings(bookings.map((b) => (b.id === editingBooking ? updated : b)));
      setEditingBooking(null);
    } catch (err) {
      console.error("Failed to update booking:", err);
      alert(err.response?.data?.message || "Time conflict detected or invalid data provided.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Loader2 className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={24} />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Syncing Global Schedule...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up max-w-7xl mx-auto px-6 py-8">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin <span className="text-indigo-600">Scheduler</span></h1>
          <p className="text-slate-500 font-medium">Full administrative oversight for all campus resource bookings.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search resource or user..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchBookings} className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Filter size={18} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border-2 border-rose-100 text-rose-600 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
          <XCircle size={40} className="text-rose-400" />
          <div className="font-bold text-lg">{error}</div>
          <button onClick={fetchBookings} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all">Retry</button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Resource / Location</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="text-slate-100 mb-2" size={64} />
                        <p className="text-slate-400 font-bold">No resource records matched your query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className={`transition-all ${editingBooking === booking.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/30'}`}>
                      
                      {editingBooking === booking.id ? (
                        <td colSpan="5" className="p-8">
                          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-6 p-8 bg-white rounded-3xl border-2 border-indigo-200 shadow-2xl relative">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Location / Resource</label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                  type="text"
                                  required
                                  value={editForm.resource}
                                  onChange={(e) => setEditForm({...editForm, resource: e.target.value})}
                                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 transition-all outline-none font-bold"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Date</label>
                              <input
                                type="date"
                                required
                                value={editForm.date}
                                onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 transition-all outline-none font-bold"
                              />
                            </div>

                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Start</label>
                                <input
                                  type="time"
                                  required
                                  value={editForm.startTime}
                                  onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 transition-all outline-none font-bold text-sm"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">End</label>
                                <input
                                  type="time"
                                  required
                                  value={editForm.endTime}
                                  onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 transition-all outline-none font-bold text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Status</label>
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 transition-all outline-none font-bold"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>

                            <div className="md:col-span-5 flex justify-end gap-3 mt-4">
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={isSaving}
                                className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSaving}
                                className="px-10 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg transition-all flex items-center gap-2"
                              >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Apply Changes
                              </button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="px-8 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-100">
                                <MapPin size={22} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-800 text-lg leading-tight">{booking.resource}</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mt-1">Resource ID: #{booking.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 leading-none">{booking.userName}</span>
                              <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Booking Initiator</span>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest border shadow-sm ${
                              booking.status === 'CONFIRMED' ? 'bg-emerald-500 text-white border-emerald-400' :
                              booking.status === 'PENDING' ? 'bg-amber-400 text-white border-amber-300' :
                              'bg-rose-500 text-white border-rose-400'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-8 py-8">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 w-fit px-3 py-1 rounded-lg">
                                <Calendar size={14} className="text-indigo-400" />
                                {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-tight px-1">
                                <Clock size={14} className="opacity-50" />
                                {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-8 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                              <button
                                onClick={() => handleEditClick(booking)}
                                className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                title="Modify Booking"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(booking.id)}
                                className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                title="Terminate Record"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBookings;
