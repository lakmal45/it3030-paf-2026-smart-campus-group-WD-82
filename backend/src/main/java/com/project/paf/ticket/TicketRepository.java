package com.project.paf.ticket;
import com.project.paf.modules.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link IncidentTicket}.
 */
@Repository
public interface TicketRepository extends JpaRepository<IncidentTicket, Long> {

    /** Find all tickets created by a specific user. */
    List<IncidentTicket> findByCreatedBy(User user);

    /** Find all tickets with a specific status. */
    List<IncidentTicket> findByStatus(TicketStatus status);

    /** Find all tickets assigned to a specific technician. */
    List<IncidentTicket> findByAssignedTechnician(User technician);

    /** Find all tickets of a specific category (e.g. ELECTRICAL, PLUMBING). */
    List<IncidentTicket> findByCategory(String category);

    /** Find tickets created by a user with a specific status. */
    List<IncidentTicket> findByCreatedByAndStatus(User user, TicketStatus status);
}

