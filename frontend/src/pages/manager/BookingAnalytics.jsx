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
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  Download
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * BookingAnalytics Component
 * Manager-level interface for analyzing and managing campus resource bookings.
 */
const BookingAnalytics = () => {
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
      setError("Unable to retrieve booking data. Please check connection.");
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

  const handleConfirm = async (id) => {
    try {
      const updated = await bookingService.confirmBooking(id);
      setBookings(bookings.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      console.error("Failed to confirm booking:", err);
      alert("Failed to confirm booking.");
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
      alert("Failed to update booking.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter(b => b.status === "PENDING").length;
  
  const popularResource = bookings.length > 0 
    ? Object.entries(bookings.reduce((acc, b) => {
        acc[b.resource] = (acc[b.resource] || 0) + 1;
        return acc;
      }, {})).sort((a,b) => b[1] - a[1])[0][0]
    : "None";

  // Chart data Preparation
  const statusData = [
    { name: 'Confirmed', value: confirmedBookings, color: '#10b981' },
    { name: 'Pending', value: pendingBookings, color: '#f59e0b' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === "CANCELLED").length, color: '#ef4444' }
  ];

  const generateReport = () => {
    if (bookings.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["ID", "Resource", "User", "Date", "Start Time", "End Time", "Status", "Reason"];
    const csvContent = [
      headers.join(","),
      ...bookings.map(b => [
        b.id,
        `"${b.resource || ''}"`,
        `"${b.userName || ''}"`,
        b.date,
        b.startTime,
        b.endTime,
        b.status,
        `"${(b.reason || '').replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `booking_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Loader2 className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={24} />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Analyzing Booking Records...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking <span className="text-indigo-600">Analytics</span></h1>
          <p className="text-slate-500 font-medium">System-wide resource trends and management dashboard.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateReport} className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
            <Download size={18} />
            Download Report
          </button>
          <button onClick={fetchBookings} className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Filter size={18} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Requests</p>
              <h3 className="text-3xl font-black text-slate-800">{totalBookings}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-500">
            <TrendingUp size={14} />
            <span>Lifetime Volume</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Confirmed</p>
              <h3 className="text-3xl font-black text-slate-800">{confirmedBookings}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Finalized reservations</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Awaiting</p>
              <h3 className="text-3xl font-black text-slate-800">{pendingBookings}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock size={20} />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Pending approval</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Top Resource</p>
              <h3 className="text-lg font-black text-slate-800 truncate max-w-[120px]">{popularResource}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Highest demand</p>
        </div>
      </div>

      {/* Chart & Table Area */}
      <div className="grid grid-cols-1 gap-10">
        
        {/* Simple Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <h2 className="text-xl font-black text-slate-800 mb-8 border-l-4 border-indigo-600 pl-4">Request Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontWeight: 'bold', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Bookings Table (Replicated from Admin) */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-4">Live Booking Log</h2>
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search resources..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Time Slot</th>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="text-slate-100 mb-2" size={64} />
                        <p className="text-slate-400 font-bold">No booking data available.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className={`group transition-all ${editingBooking === booking.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/30'}`}>
                      
                      {editingBooking === booking.id ? (
                        <td colSpan="5" className="p-8">
                          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-6 p-8 bg-white rounded-3xl border-2 border-indigo-200 shadow-2xl">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Location</label>
                              <input
                                type="text"
                                required
                                value={editForm.resource}
                                onChange={(e) => setEditForm({...editForm, resource: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Date</label>
                              <input
                                type="date"
                                required
                                value={editForm.date}
                                onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none font-bold text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Start</label>
                                <input
                                  type="time"
                                  required
                                  value={editForm.startTime}
                                  onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                                  className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none font-bold text-xs"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">End</label>
                                <input
                                  type="time"
                                  required
                                  value={editForm.endTime}
                                  onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                                  className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none font-bold text-xs"
                                />
                              </div>
                            </div>
                            <div>
                               <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Status</label>
                               <select
                                 value={editForm.status}
                                 onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                 className="w-full px-2 py-2.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none font-bold text-sm"
                               >
                                 <option value="PENDING">PENDING</option>
                                 <option value="CONFIRMED">CONFIRMED</option>
                                 <option value="CANCELLED">CANCELLED</option>
                               </select>
                            </div>
                            <div className="md:col-span-5 flex justify-end gap-3">
                              <button type="button" onClick={cancelEdit} className="px-6 py-2.5 text-sm font-bold text-slate-400">Cancel</button>
                              <button type="submit" disabled={isSaving} className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                Update
                              </button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="px-8 py-8">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                                <MapPin size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 leading-tight">{booking.resource}</span>
                                <span className="text-[10px] font-black text-slate-300 uppercase mt-1">ID: #{booking.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <span className="font-bold text-slate-700">{booking.userName}</span>
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
                            <div className="flex flex-col gap-1">
                              <div className="text-sm font-bold text-slate-600">{new Date(booking.date).toLocaleDateString()}</div>
                              <div className="text-[11px] font-black text-slate-400 uppercase">{booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}</div>
                            </div>
                          </td>
                          <td className="px-8 py-8 text-right">
                            <div className="flex items-center justify-end gap-1 transition-all">
                              {booking.status === 'PENDING' && (
                                <button onClick={() => handleConfirm(booking.id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all" title="Confirm">
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              <button onClick={() => handleEditClick(booking)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all" title="Edit">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => handleDelete(booking.id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md rounded-xl transition-all" title="Delete">
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
      </div>
    </div>
  );
};

export default BookingAnalytics;
