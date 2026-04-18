package com.project.paf.ticket;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link TicketComment}.
 */
@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    /** Find all comments for a given ticket, ordered by creation time. */
    @EntityGraph(attributePaths = {"author"})
    List<TicketComment> findByTicketOrderByCreatedAtAsc(IncidentTicket ticket);

    /** Find all comments for a given ticket with pagination and eager-loaded author. */
    @EntityGraph(attributePaths = {"author"})
    org.springframework.data.domain.Page<TicketComment> findByTicket(IncidentTicket ticket, org.springframework.data.domain.Pageable pageable);

    /** Find all comments for a given ticket (unordered shorthand). */
    List<TicketComment> findByTicket(IncidentTicket ticket);
}
