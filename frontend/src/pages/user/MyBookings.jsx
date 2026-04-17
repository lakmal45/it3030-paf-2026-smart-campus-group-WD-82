import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load bookings.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setCancellingId(id);
      await bookingService.cancelBooking(id);
      // Refresh the list
      await fetchBookings();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to cancel booking.";
      alert(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
        <button
          onClick={() => navigate("/dashboard/user/create-booking")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + New Booking
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
          <button onClick={fetchBookings} className="ml-2 underline font-medium">
            Retry
          </button>
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No bookings yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            You haven't made any bookings. Create one to reserve campus resources.
          </p>
          <button
            onClick={() => navigate("/dashboard/user/create-booking")}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Create Your First Booking
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Resource</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Start Time</th>
                <th className="p-4 font-semibold">End Time</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-700 font-medium">#{booking.id}</td>
                  <td className="p-4 text-slate-600">{booking.resource}</td>
                  <td className="p-4 text-slate-600">{booking.date}</td>
                  <td className="p-4 text-slate-600">{booking.startTime}</td>
                  <td className="p-4 text-slate-600">{booking.endTime}</td>
                  <td className="p-4 text-slate-600 max-w-[200px] truncate" title={booking.reason}>
                    {booking.reason}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {booking.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
