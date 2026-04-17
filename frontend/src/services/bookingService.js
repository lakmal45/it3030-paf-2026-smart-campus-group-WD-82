import api from "./api";

const bookingService = {
  /**
   * Create a new booking.
   */
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  /**
   * Get all bookings for the currently logged-in user.
   */
  getMyBookings: async () => {
    const response = await api.get("/bookings/my");
    return response.data;
  },

  /**
   * Cancel a booking by ID.
   */
  cancelBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export default bookingService;
