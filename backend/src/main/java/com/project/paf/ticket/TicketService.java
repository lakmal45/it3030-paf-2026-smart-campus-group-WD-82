package com.project.paf.ticket;

import com.project.paf.modules.resource.exception.ResourceNotFoundException;
import com.project.paf.modules.user.model.Role;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import com.smartcampus.notification.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business-logic service for the Maintenance & Incident Ticketing System.
 *
 * <p>This service enforces:
 * <ul>
 *   <li>Role-based visibility (USER sees only their own tickets).</li>
 *   <li>Strict status-transition rules.</li>
 *   <li>Comment ownership (only the author or an ADMIN may edit/delete).</li>
 *   <li>Image upload limits (max 3 per ticket).</li>
 * </ul>
 */
@Slf4j
@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository commentRepository,
                         FileStorageService fileStorageService,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Ticket CRUD
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new incident ticket with status {@link TicketStatus#OPEN}.
     *
     * @param request     validated request body
     * @param currentUser the authenticated user submitting the ticket
     * @return the persisted ticket as a {@link TicketResponse}
     */
    public TicketResponse createTicket(CreateTicketRequest request, User currentUser) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setCreatedBy(currentUser);
        ticket.setLocation(request.getLocation());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setResourceId(request.getResourceId());
        ticket.setStatus(TicketStatus.OPEN);

        IncidentTicket saved = ticketRepository.save(ticket);
        log.info("Ticket #{} created by user '{}'", saved.getId(), currentUser.getEmail());
        return mapToResponse(saved);
    }

    /**
     * Updates an existing ticket's details.
     * Allowed only for the creator (while OPEN) or an ADMIN.
     *
     * @param id          target ticket
     * @param request     new details
     * @param currentUser authenticated caller
     * @return updated ticket
     */
    public TicketResponse updateTicket(Long id, UpdateTicketRequest request, User currentUser) {
        IncidentTicket ticket = findTicketOrThrow(id);

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isCreator = ticket.getCreatedBy().getId().equals(currentUser.getId());
        boolean isOpen = ticket.getStatus() == TicketStatus.OPEN;

        if (!isAdmin && !(isCreator && isOpen)) {
            throw new AccessDeniedException("You are not authorised to edit this ticket. " +
                    (isCreator ? "Tickets can only be edited while they are OPEN." : "Only the admin or creator may edit tickets."));
        }

        ticket.setLocation(request.getLocation());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setResourceId(request.getResourceId());

        IncidentTicket updated = ticketRepository.save(ticket);
        log.info("Ticket #{} updated by user '{}'", id, currentUser.getEmail());
        return mapToResponse(updated);
    }

    /**
     * Retrieves a single ticket by its ID.
     *
     * @param id ticket primary key
     * @return the ticket as a {@link TicketResponse}
     * @throws ResourceNotFoundException if no ticket exists with the given id
     */
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        IncidentTicket ticket = findTicketOrThrow(id);
        return mapToResponse(ticket);
    }

    /**
     * Returns tickets visible to the current user.
     *
     * <ul>
     *   <li>ADMIN / TECHNICIAN → all tickets (with optional status filter).</li>
     *   <li>USER → only their own tickets (with optional status filter).</li>
     * </ul>
     *
     * @param statusFilter   optional status string to filter by
     * @param categoryFilter optional category string to filter by
     * @param priorityFilter optional priority string to filter by
     * @param currentUser    the authenticated caller
     * @return list of {@link TicketResponse}
     */
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets(String statusFilter, String categoryFilter, String priorityFilter, User currentUser) {
        boolean isPrivileged = currentUser.getRole() == Role.ADMIN
                || currentUser.getRole() == Role.TECHNICIAN
                || currentUser.getRole() == Role.MANAGER;

        List<IncidentTicket> tickets;

        if (statusFilter != null && !statusFilter.isBlank()) {
            TicketStatus status = parseStatus(statusFilter);
            if (isPrivileged) {
                tickets = ticketRepository.findByStatus(status);
            } else {
                tickets = ticketRepository.findByCreatedByAndStatus(currentUser, status);
            }
        } else {
            if (isPrivileged) {
                tickets = ticketRepository.findAll();
            } else {
                tickets = ticketRepository.findByCreatedBy(currentUser);
            }
        }

        if (categoryFilter != null && !categoryFilter.isBlank()) {
            tickets = tickets.stream()
                             .filter(t -> t.getCategory().equalsIgnoreCase(categoryFilter))
                             .collect(Collectors.toList());
        }

        if (priorityFilter != null && !priorityFilter.isBlank()) {
            tickets = tickets.stream()
                             .filter(t -> t.getPriority().equalsIgnoreCase(priorityFilter))
                             .collect(Collectors.toList());
        }

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Updates the status of a ticket, enforcing strict transition rules.
     *
     * <p>Valid transitions:
     * <pre>
     *   OPEN        → IN_PROGRESS | REJECTED
     *   IN_PROGRESS → RESOLVED    | REJECTED
     *   RESOLVED    → CLOSED      | REJECTED
     *   CLOSED      → (terminal)
     *   REJECTED    → (terminal)
     * </pre>
     *
     * @param id          ticket ID
     * @param request     the requested new status and optional notes
     * @param currentUser must be ADMIN or TECHNICIAN
     * @return updated ticket as {@link TicketResponse}
     * @throws IllegalStateException if the transition is not permitted
     */
    public TicketResponse updateTicketStatus(Long id,
                                             UpdateTicketStatusRequest request,
                                             User currentUser) {
        if (currentUser.getRole() == Role.USER) {
            throw new AccessDeniedException("Only ADMIN or TECHNICIAN can update ticket status.");
        }

        IncidentTicket ticket = findTicketOrThrow(id);
        TicketStatus current = ticket.getStatus();
        TicketStatus next = request.getStatus();

        validateTransition(current, next);

        ticket.setStatus(next);
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        IncidentTicket updated = ticketRepository.save(ticket);
        log.info("Ticket #{} status changed: {} → {} by '{}'",
                id, current, next, currentUser.getEmail());

        notificationService.sendNotification(
            ticket.getCreatedBy(),
            "Your ticket #" + ticket.getId() + " status changed to " + next,
            "TICKET_UPDATE"
        );

        return mapToResponse(updated);
    }

    /**
     * Assigns a technician to a ticket and sets its status to
     * {@link TicketStatus#IN_PROGRESS}.
     * Only ADMIN users may call this method (enforced by the controller).
     *
     * @param ticketId     the ticket to assign
     * @param technicianId ID of the user with TECHNICIAN role
     * @param currentUser  must be ADMIN
     * @return updated ticket as {@link TicketResponse}
     * @throws ResourceNotFoundException if the technician user does not exist
     */
    public TicketResponse assignTechnician(Long ticketId, Long technicianId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only ADMIN can assign technicians.");
        }

        IncidentTicket ticket = findTicketOrThrow(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Technician not found with id: " + technicianId));

        ticket.setAssignedTechnician(technician);
        // Automatically move ticket to IN_PROGRESS when assigned
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        IncidentTicket updated = ticketRepository.save(ticket);
        log.info("Ticket #{} assigned to technician '{}' by admin '{}'",
                ticketId, technician.getEmail(), currentUser.getEmail());

        notificationService.sendNotification(
            technician,
            "You have been assigned to ticket #" + ticket.getId(),
            "TICKET_UPDATE"
        );

        return mapToResponse(updated);
    }

    /**
     * Uploads up to 3 images for a ticket, enforcing the cumulative 3-image cap.
     *
     * @param ticketId the ticket to attach images to
     * @param files    list of image files (must not exceed total of 3 with existing)
     * @return updated ticket as {@link TicketResponse}
     * @throws IllegalStateException if the upload would exceed the 3-image limit
     */
    public TicketResponse uploadImages(Long ticketId, List<MultipartFile> files) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);

        int existing = ticket.getImageUrls().size();
        if (existing + files.size() > 3) {
            throw new IllegalStateException(
                    "A ticket may have at most 3 images. Currently has " + existing
                            + "; tried to add " + files.size() + ".");
        }

        for (MultipartFile file : files) {
            String path = fileStorageService.store(file);
            ticket.getImageUrls().add(path);
        }

        IncidentTicket updated = ticketRepository.save(ticket);
        log.info("Added {} image(s) to ticket #{}", files.size(), ticketId);
        return mapToResponse(updated);
    }

    /**
     * Hard-deletes a ticket. Only ADMIN users may call this method.
     *
     * @param id          ticket to delete
     * @param currentUser must be ADMIN
     */
    public void deleteTicket(Long id, User currentUser) {
        IncidentTicket ticket = findTicketOrThrow(id);
        
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isCreator = ticket.getCreatedBy().getId().equals(currentUser.getId());
        boolean isOpen = ticket.getStatus() == TicketStatus.OPEN;

        if (!isAdmin && !(isCreator && isOpen)) {
            throw new AccessDeniedException("You are not authorized to delete this ticket. " +
                    (isCreator ? "Tickets can only be deleted while they are OPEN." : "Only the admin or creator may delete tickets."));
        }

        ticketRepository.delete(ticket);
        log.info("Ticket #{} deleted by user '{}'", id, currentUser.getEmail());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Comment Operations
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Adds a comment to a ticket.
     *
     * @param ticketId    the target ticket
     * @param request     validated comment body
     * @param currentUser the authenticated author
     * @return the persisted comment as {@link CommentResponse}
     */
    public CommentResponse addComment(Long ticketId, CommentRequest request, User currentUser) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(currentUser);
        comment.setContent(request.getContent());

        TicketComment saved = commentRepository.save(comment);
        log.info("Comment #{} added to ticket #{} by '{}'",
                saved.getId(), ticketId, currentUser.getEmail());

        if (!currentUser.getId().equals(ticket.getCreatedBy().getId())) {
            notificationService.sendNotification(
                ticket.getCreatedBy(),
                "New comment added on your ticket #" + ticket.getId(),
                "COMMENT_ADDED"
            );
        }

        return mapToCommentResponse(saved);
    }

    /**
     * Edits an existing comment. Only the original author or an ADMIN may edit.
     *
     * @param commentId   the comment to edit
     * @param request     new content
     * @param currentUser the authenticated caller
     * @return updated comment as {@link CommentResponse}
     * @throws AccessDeniedException if the caller is not the author or ADMIN
     */
    public CommentResponse editComment(Long commentId, CommentRequest request, User currentUser) {
        TicketComment comment = findCommentOrThrow(commentId);
        assertOwnerOrAdmin(comment.getAuthor(), currentUser, "edit");

        comment.setContent(request.getContent());
        TicketComment updated = commentRepository.save(comment);
        log.info("Comment #{} edited by '{}'", commentId, currentUser.getEmail());
        return mapToCommentResponse(updated);
    }

    /**
     * Deletes a comment. Only the original author or an ADMIN may delete.
     *
     * @param commentId   the comment to delete
     * @param currentUser the authenticated caller
     * @throws AccessDeniedException if the caller is not the author or ADMIN
     */
    public void deleteComment(Long commentId, User currentUser) {
        TicketComment comment = findCommentOrThrow(commentId);
        assertOwnerOrAdmin(comment.getAuthor(), currentUser, "delete");
        commentRepository.delete(comment);
        log.info("Comment #{} deleted by '{}'", commentId, currentUser.getEmail());
    }

    /**
     * Returns all comments for a ticket ordered by creation time.
     *
     * @param ticketId the ticket whose comments to fetch
     * @return list of {@link CommentResponse}
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long ticketId) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket)
                .stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private IncidentTicket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private TicketComment findCommentOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
    }

    private void assertOwnerOrAdmin(User author, User currentUser, String action) {
        boolean isOwner = author.getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException(
                    "You are not authorised to " + action + " this comment.");
        }
    }

    /**
     * Validates a requested status transition and throws {@link IllegalStateException}
     * with a descriptive message if the transition is not allowed.
     */
    private void validateTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED    || next == TicketStatus.REJECTED;
            case RESOLVED    -> next == TicketStatus.CLOSED      || next == TicketStatus.REJECTED;
            case CLOSED, REJECTED -> false; // terminal states
        };

        if (!valid) {
            throw new IllegalStateException(
                    "Invalid status transition: cannot move from " + current + " to " + next + ". "
                            + "Allowed from " + current + ": " + allowedFrom(current));
        }
    }

    private String allowedFrom(TicketStatus status) {
        return switch (status) {
            case OPEN        -> "[IN_PROGRESS, REJECTED]";
            case IN_PROGRESS -> "[RESOLVED, REJECTED]";
            case RESOLVED    -> "[CLOSED, REJECTED]";
            case CLOSED, REJECTED -> "none (terminal state)";
        };
    }

    private TicketStatus parseStatus(String raw) {
        try {
            return TicketStatus.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("Unknown ticket status: " + raw);
        }
    }

    /**
     * Maps an {@link IncidentTicket} entity to a {@link TicketResponse} DTO.
     */
    private TicketResponse mapToResponse(IncidentTicket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setLocation(ticket.getLocation());
        response.setCategory(ticket.getCategory());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setImageUrls(ticket.getImageUrls());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setPreferredContact(ticket.getPreferredContact());
        response.setResourceId(ticket.getResourceId());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        if (ticket.getCreatedBy() != null) {
            response.setCreatedByName(ticket.getCreatedBy().getName());
            response.setCreatedByEmail(ticket.getCreatedBy().getEmail());
            response.setCreatedById(ticket.getCreatedBy().getId());
        }

        if (ticket.getAssignedTechnician() != null) {
            response.setAssignedTechnicianName(ticket.getAssignedTechnician().getName());
            response.setAssignedTechnicianId(ticket.getAssignedTechnician().getId());
        }

        return response;
    }

    /**
     * Maps a {@link TicketComment} entity to a {@link CommentResponse} DTO.
     */
    private CommentResponse mapToCommentResponse(TicketComment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        if (comment.getAuthor() != null) {
            response.setAuthorName(comment.getAuthor().getName());
            response.setAuthorId(comment.getAuthor().getId());
        }
        return response;
    }
}
