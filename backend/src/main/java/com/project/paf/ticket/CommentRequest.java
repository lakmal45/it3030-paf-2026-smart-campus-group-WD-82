package com.project.paf.ticket;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request body for adding or editing a comment on an {@link IncidentTicket}.
 */
@Getter
@Setter
public class CommentRequest {

    @NotBlank(message = "Comment content is required")
    private String content;
}
