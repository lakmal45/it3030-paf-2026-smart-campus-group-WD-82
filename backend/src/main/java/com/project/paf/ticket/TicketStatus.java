package com.project.paf.ticket;

/**
 * Lifecycle states for an {@link IncidentTicket}.
 *
 * <p>Valid transitions:
 * <pre>
 *   OPEN → IN_PROGRESS | REJECTED
 *   IN_PROGRESS → RESOLVED | REJECTED
 *   RESOLVED → CLOSED | REJECTED
 *   CLOSED → (terminal – no further transitions)
 *   REJECTED → (terminal – no further transitions)
 * </pre>
 */
public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REJECTED
}
