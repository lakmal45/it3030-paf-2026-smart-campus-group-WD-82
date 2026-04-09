package com.project.paf.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Request body for assigning a technician to an {@link IncidentTicket}.
 */
@Getter
@Setter
public class AssignTechnicianRequest {

    @NotNull(message = "Technician ID is required")
    private Long technicianId;
}
