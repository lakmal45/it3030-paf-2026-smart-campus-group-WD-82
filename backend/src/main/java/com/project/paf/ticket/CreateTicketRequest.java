package com.project.paf.ticket;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request body for creating a new {@link IncidentTicket}.
 */
@Getter
@Setter
public class CreateTicketRequest {

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    /** Optional — how the reporter prefers to be contacted. */
    private String preferredContact;

    /** Optional — ID of a resource from the resource catalogue. */
    private String resourceId;
}
