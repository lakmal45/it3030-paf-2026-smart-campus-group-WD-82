package com.project.paf.modules.auditlog;

import com.project.paf.modules.user.model.Role;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Map;

/**
 * Admin-only REST controller exposing the audit log.
 *
 * <p>Base path: {@code /api/admin/audit-logs}
 * <p>All endpoints require the caller to have the {@link Role#ADMIN} role,
 * enforced via the same session/header pattern used across this project.
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public AuditLogController(AuditLogService auditLogService,
                               UserRepository userRepository) {
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/admin/audit-logs
     * Returns a paginated, filterable list of audit log entries.
     *
     * @param category optional filter: BOOKING | TICKET | USER | RESOURCE | ALL
     * @param search   optional free-text search across actor name and description
     * @param from     optional start date (inclusive), ISO format yyyy-MM-dd
     * @param to       optional end date (inclusive), ISO format yyyy-MM-dd
     * @param page     zero-based page number (default 0)
     * @param size     page size (default 20)
     */
    @GetMapping
    public ResponseEntity<Page<AuditLogDTO>> getLogs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);
        return ResponseEntity.ok(auditLogService.getLogs(category, search, from, to, page, size));
    }

    /**
     * GET /api/admin/audit-logs/stats
     * Returns per-category event counts + total for the summary cards.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats(
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);
        return ResponseEntity.ok(auditLogService.getStats());
    }

    // ── Private guard ─────────────────────────────────────────────────────────

    private void requireAdmin(HttpSession session, String emailHeader) {
        User resolved = null;

        Object sessionAttr = session.getAttribute("user");
        if (sessionAttr instanceof User u) {
            resolved = u;
        }

        if (resolved == null && emailHeader != null && !emailHeader.isBlank()) {
            resolved = userRepository.findByEmail(emailHeader).orElse(null);
        }

        if (resolved == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in");
        }
        if (resolved.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
