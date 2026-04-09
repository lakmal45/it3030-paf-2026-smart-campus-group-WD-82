package com.project.paf.ticket;

import com.project.paf.modules.auth.model.User;
import com.project.paf.modules.auth.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for the Maintenance & Incident Ticketing System.
 *
 * <p>Base path: {@code /api/tickets}
 *
 * <p>Authentication is enforced at the SecurityConfig level.
 * Fine-grained role checks use {@code @PreAuthorize} or are delegated to the service.
 */
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Ticket Endpoints
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/tickets — Create a new incident ticket.
     * Accessible to all authenticated users.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Principal principal) {

        User currentUser = resolveUser(principal);
        TicketResponse response = ticketService.createTicket(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/tickets — List tickets (filtered by role and optional status).
     * ADMIN/TECHNICIAN: all tickets. USER: own tickets only.
     */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam(required = false) String status,
            Principal principal) {

        User currentUser = resolveUser(principal);
        return ResponseEntity.ok(ticketService.getAllTickets(status, currentUser));
    }

    /**
     * GET /api/tickets/{id} — Get a single ticket by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    /**
     * PUT /api/tickets/{id}/status — Update ticket status.
     * Only ADMIN or TECHNICIAN may call this endpoint.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'MANAGER')")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Principal principal) {

        User currentUser = resolveUser(principal);
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request, currentUser));
    }

    /**
     * PUT /api/tickets/{id}/assign — Assign a technician to a ticket.
     * Only ADMIN may call this endpoint.
     */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequest request,
            Principal principal) {

        User currentUser = resolveUser(principal);
        return ResponseEntity.ok(
                ticketService.assignTechnician(id, request.getTechnicianId(), currentUser));
    }

    /**
     * DELETE /api/tickets/{id} — Hard-delete a ticket.
     * Only ADMIN may call this endpoint.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id, Principal principal) {
        User currentUser = resolveUser(principal);
        ticketService.deleteTicket(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/tickets/{id}/images — Upload images (max 3 total per ticket).
     * Accepts multipart/form-data with field name "files".
     */
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        return ResponseEntity.ok(ticketService.uploadImages(id, files));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Comment Endpoints
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/tickets/{id}/comments — List all comments for a ticket.
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    /**
     * POST /api/tickets/{id}/comments — Add a comment.
     * Returns 201 Created.
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            Principal principal) {

        User currentUser = resolveUser(principal);
        CommentResponse response = ticketService.addComment(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/tickets/{ticketId}/comments/{commentId} — Edit a comment.
     * Ownership is enforced in the service layer.
     */
    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<CommentResponse> editComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
            Principal principal) {

        User currentUser = resolveUser(principal);
        return ResponseEntity.ok(ticketService.editComment(commentId, request, currentUser));
    }

    /**
     * DELETE /api/tickets/{ticketId}/comments/{commentId} — Delete a comment.
     * Ownership is enforced in the service layer.
     */
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Principal principal) {

        User currentUser = resolveUser(principal);
        ticketService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolves the current {@link User} from the Spring Security principal.
     * The principal name is the user's email (set by CustomUserDetailsService).
     *
     * <p>Falls back to the {@code X-User-Email} header check is done upstream
     * by the axios interceptor / SecurityConfig.
     */
    private User resolveUser(Principal principal) {
        if (principal == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new com.project.paf.exception.ResourceNotFoundException(
                        "Authenticated user not found: " + principal.getName()));
    }
}
