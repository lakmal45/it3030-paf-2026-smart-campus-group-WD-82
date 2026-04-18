import api from "./api";

/**
 * API service for the Maintenance & Incident Ticketing System.
 * All requests use the shared axios instance which automatically
 * attaches the session cookie and X-User-Email header.
 */
const ticketService = {
  /**
   * Fetch all tickets. Pass status, category, or priority to filter.
   */
  getAll: (status, category, priority, keyword, page = 0, size = 20) => {
    const params = { page, size };
    if (status && status !== "All") params.status = status;
    if (category && category !== "All") params.category = category;
    if (priority && priority !== "All") params.priority = priority;
    if (keyword) params.keyword = keyword;
    return api.get("/tickets", { params });
  },

  /** Fetch a single ticket by ID. */
  getById: (id) => api.get(`/tickets/${id}`),

  /** Create a new ticket. */
  create: (data) => api.post("/tickets", data),

  /** Update an existing ticket (location, description, etc.). */
  update: (id, data) => api.put(`/tickets/${id}`, data),

  /** Update a ticket's status (and optionally resolution notes). */
  updateStatus: (id, status, resolutionNotes) =>
    api.put(`/tickets/${id}/status`, { status, resolutionNotes }),

  /** Assign a technician to a ticket (ADMIN only). */
  assign: (id, technicianId) =>
    api.put(`/tickets/${id}/assign`, { technicianId }),

  /** Hard-delete a ticket (ADMIN only). */
  deleteTicket: (id) => api.delete(`/tickets/${id}`),

  /**
   * Upload images for a ticket (multipart/form-data).
   * @param {number} id - Ticket ID
   * @param {File[]} files - Array of File objects (max 3 total per ticket)
   */
  uploadImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.post(`/tickets/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** Fetch comments for a ticket with pagination. */
  getComments: (id, page = 0, size = 10) =>
    api.get(`/tickets/${id}/comments`, { params: { page, size } }),

  /** Add a comment to a ticket. */
  addComment: (id, content) =>
    api.post(`/tickets/${id}/comments`, { content }),

  /** Edit a comment (author or ADMIN only). */
  editComment: (ticketId, commentId, content) =>
    api.put(`/tickets/${ticketId}/comments/${commentId}`, { content }),

  /** Delete a comment (author or ADMIN only). */
  deleteComment: (ticketId, commentId) =>
    api.delete(`/tickets/${ticketId}/comments/${commentId}`),

  /** Fetch all technicians (ADMIN only). */
  getTechnicians: () => api.get("/admin/technicians"),
};

export default ticketService;
