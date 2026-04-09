package com.project.paf.ticket;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response DTO for {@link TicketComment}.
 */
@Getter
@Setter
public class CommentResponse {

    private Long id;
    private String content;
    private String authorName;
    private Long authorId;
    private LocalDateTime createdAt;
}
