package com.project.paf.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Request body for updating the status of an {@link IncidentTicket}.
 */
@Getter
@Setter
public class UpdateTicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    /** Optional resolution notes — required when resolving or closing. */
    private String resolutionNotes;
}
