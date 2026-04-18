package com.project.paf.ticket;

import com.project.paf.modules.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link IncidentTicket}.
 */
@Repository
public interface TicketRepository extends JpaRepository<IncidentTicket, Long>, JpaSpecificationExecutor<IncidentTicket> {

    /** 
     * Fetch tickets with filters at the database level and eager loading of relations.
     */
    @EntityGraph(attributePaths = {"createdBy", "assignedTechnician", "imageUrls"})
    @Query("SELECT t FROM IncidentTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR LOWER(t.category) = LOWER(:category)) AND " +
           "(:priority IS NULL OR LOWER(t.priority) = LOWER(:priority)) AND " +
           "(:createdBy IS NULL OR t.createdBy = :createdBy) AND " +
           "(:assignedTechnician IS NULL OR t.assignedTechnician = :assignedTechnician) AND " +
           "(:keyword IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<IncidentTicket> findAllWithFilters(
            @Param("status") TicketStatus status,
            @Param("category") String category,
            @Param("priority") String priority,
            @Param("createdBy") User createdBy,
            @Param("assignedTechnician") User assignedTechnician,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"createdBy", "assignedTechnician", "imageUrls"})
    @org.springframework.lang.NonNull
    Optional<IncidentTicket> findById(@org.springframework.lang.NonNull Long id);

    /** Find all tickets created by a specific user. */
    List<IncidentTicket> findByCreatedBy(User user);

    /** Find all tickets with a specific status. */
    List<IncidentTicket> findByStatus(TicketStatus status);

    /** Find all tickets assigned to a specific technician. */
    List<IncidentTicket> findByAssignedTechnician(User technician);

    /** Find tickets assigned to a specific technician with a specific status. */
    List<IncidentTicket> findByAssignedTechnicianAndStatus(User technician, TicketStatus status);

    /** Find all tickets of a specific category (e.g. ELECTRICAL, PLUMBING). */
    List<IncidentTicket> findByCategory(String category);

    /** Find tickets created by a user with a specific status. */
    List<IncidentTicket> findByCreatedByAndStatus(User user, TicketStatus status);
}

