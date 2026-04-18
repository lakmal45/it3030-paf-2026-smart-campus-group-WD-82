package com.project.paf.ticket;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for {@link IncidentTicket} — never exposes the raw entity directly.
 */
@Getter
@Setter
public class TicketResponse {

    private Long id;
    private String location;
    private String category;
    private String description;
    private String priority;
    private TicketStatus status;
    private List<String> imageUrls;
    private String resolutionNotes;
    private String preferredContact;
    private String resourceId;

    /** Full name of the user who created the ticket. */
    private String createdByName;

    /** Email of the user who created the ticket (used for display). */
    private String createdByEmail;

    /** ID of the user who created the ticket. */
    private Long createdById;

    /** Full name of the assigned technician, or null if unassigned. */
    private String assignedTechnicianName;

    /** ID of the assigned technician, or null. */
    private Long assignedTechnicianId;

    private Integer rating;
    private String userFeedback;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
