package com.project.paf.modules.auditlog;

/**
 * Enumeration of every loggable system action.
 * Each constant belongs to a named category used for grouping in the UI.
 */
public enum AuditAction {

    // ── Bookings ──────────────────────────────────────────────────────────────
    BOOKING_CREATED,
    BOOKING_CONFIRMED,
    BOOKING_CANCELLED,
    BOOKING_REJECTED,
    BOOKING_UPDATED,
    BOOKING_DELETED,

    // ── Tickets ───────────────────────────────────────────────────────────────
    TICKET_CREATED,
    TICKET_STATUS_UPDATED,
    TICKET_ASSIGNED,
    TICKET_DELETED,
    TICKET_COMMENT_ADDED,

    // ── Users ─────────────────────────────────────────────────────────────────
    USER_CREATED,
    USER_ROLE_CHANGED,
    USER_DELETED,

    // ── Resources ─────────────────────────────────────────────────────────────
    RESOURCE_CREATED,
    RESOURCE_UPDATED,
    RESOURCE_DELETED;

    /** Returns the high-level category string for this action (for UI grouping). */
    public String getCategory() {
        String name = this.name();
        if (name.startsWith("BOOKING_"))  return "BOOKING";
        if (name.startsWith("TICKET_"))   return "TICKET";
        if (name.startsWith("USER_"))     return "USER";
        if (name.startsWith("RESOURCE_")) return "RESOURCE";
        return "OTHER";
    }

    /** Returns a human-friendly label for display in the UI. */
    public String getLabel() {
        return switch (this) {
            case BOOKING_CREATED   -> "Booking Created";
            case BOOKING_CONFIRMED -> "Booking Confirmed";
            case BOOKING_CANCELLED -> "Booking Cancelled";
            case BOOKING_REJECTED  -> "Booking Rejected";
            case BOOKING_UPDATED   -> "Booking Updated";
            case BOOKING_DELETED   -> "Booking Deleted";
            case TICKET_CREATED       -> "Ticket Created";
            case TICKET_STATUS_UPDATED -> "Ticket Status Updated";
            case TICKET_ASSIGNED      -> "Ticket Assigned";
            case TICKET_DELETED       -> "Ticket Deleted";
            case TICKET_COMMENT_ADDED -> "Comment Added";
            case USER_CREATED      -> "User Created";
            case USER_ROLE_CHANGED -> "Role Changed";
            case USER_DELETED      -> "User Deleted";
            case RESOURCE_CREATED -> "Resource Created";
            case RESOURCE_UPDATED -> "Resource Updated";
            case RESOURCE_DELETED -> "Resource Deleted";
        };
    }
}
