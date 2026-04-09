package com.project.paf.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link TicketComment}.
 */
@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    /** Find all comments for a given ticket, ordered by creation time. */
    List<TicketComment> findByTicketOrderByCreatedAtAsc(IncidentTicket ticket);

    /** Find all comments for a given ticket (unordered shorthand). */
    List<TicketComment> findByTicket(IncidentTicket ticket);
}
