package com.project.paf.modules.user.controller;

import com.project.paf.modules.auditlog.AuditAction;
import com.project.paf.modules.auditlog.AuditLogService;
import com.project.paf.modules.notification.service.EmailService;
import com.project.paf.modules.user.model.Role;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AdminController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final AuditLogService auditLogService;
    private final EmailService emailService;

    public AdminController(UserRepository repo, PasswordEncoder encoder,
                           AuditLogService auditLogService, EmailService emailService) {
        this.repo = repo;
        this.encoder = encoder;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }

    /**
     * Guard: resolves the current admin from either:
     *  1. The Spring HttpSession (set by AuthController.login)
     *  2. The X-User-Email header (sent by the frontend as a fallback)
     * Then verifies the resolved user has ADMIN role in the DB.
     */
    private void requireAdmin(HttpSession session, String emailHeader) {

        User resolved = null;

        // ── 1. Try session first ──────────────────────────────────────────────
        Object sessionAttr = session.getAttribute("user");
        if (sessionAttr instanceof User) {
            resolved = (User) sessionAttr;
        }

        // ── 2. Fall back to email header – re-verify from DB ─────────────────
        if (resolved == null && emailHeader != null && !emailHeader.isBlank()) {
            resolved = repo.findByEmail(emailHeader).orElse(null);
        }

        if (resolved == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in");
        }

        if (resolved.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    // ── GET all users ─────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);
        return ResponseEntity.ok(repo.findAll());
    }

    // ── GET all technicians ───────────────────────────────────────────────────
    @GetMapping("/technicians")
    public ResponseEntity<List<User>> getTechnicians(
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);
        return ResponseEntity.ok(repo.findByRole(Role.TECHNICIAN));
    }

    // ── UPDATE user role ──────────────────────────────────────────────────────
    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable @NonNull Long id,
            @RequestParam Role role,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);

        User user = repo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(role);
        User saved = repo.save(user);

        // Resolve acting admin for audit
        User admin = resolveActingUser(session, emailHeader);
        auditLogService.log(AuditAction.USER_ROLE_CHANGED, admin,
                "User '" + user.getName() + "' (" + user.getEmail() + ") role changed to " + role,
                "User", id);

        // Send email and in-app notification to the user about their role change
        emailService.notifyRoleChanged(saved, saved.getRole().name());

        return ResponseEntity.ok(saved);
    }

    // ── DELETE user ───────────────────────────────────────────────────────────
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable @NonNull Long id,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);

        User user = repo.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String deletedName = user.getName();
        String deletedEmail = user.getEmail();

        repo.deleteById(java.util.Objects.requireNonNull(id));

        User admin = resolveActingUser(session, emailHeader);
        auditLogService.log(AuditAction.USER_DELETED, admin,
                "User '" + deletedName + "' (" + deletedEmail + ") deleted",
                "User", id);

        return ResponseEntity.noContent().build();
    }

    // ── CREATE user (admin) ───────────────────────────────────────────────────
    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestBody Map<String, String> body,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);

        String name  = body.get("name");
        String email = body.get("email");
        String role  = body.get("role");

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        // If name was not provided, derive it from the email prefix (e.g. "john.doe" from "john.doe@uni.edu")
        if (name == null || name.isBlank()) {
            name = email.contains("@") ? email.substring(0, email.indexOf("@")) : email;
        }

        // Check duplicate email
        if (repo.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A user with this email already exists");
        }

        // Generate a secure random password
        String plainPassword = generateRandomPassword(10);

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(plainPassword));
        user.setRole(role != null ? Role.valueOf(role) : Role.USER);

        User saved = repo.save(user);

        // Email the temporary password directly to the new user — admin never sees it
        emailService.notifyAdminCreatedUser(
                saved.getName(), saved.getEmail(), plainPassword, saved.getRole().name());

        // Return only safe fields — password is NOT included in the response
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        response.put("role", saved.getRole().name());

        User admin = resolveActingUser(session, emailHeader);
        auditLogService.log(AuditAction.USER_CREATED, admin,
                "New user '" + saved.getName() + "' (" + saved.getEmail() + ") created with role " + saved.getRole(),
                "User", saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Generates a random alphanumeric password of the given length. */
    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Resolves the acting user from session or header WITHOUT enforcing admin role.
     * Used to supply the actor to audit log entries after requireAdmin() has already passed.
     */
    private User resolveActingUser(HttpSession session, String emailHeader) {
        Object attr = session.getAttribute("user");
        if (attr instanceof User u) return u;
        if (emailHeader != null && !emailHeader.isBlank()) {
            return repo.findByEmail(emailHeader).orElse(null);
        }
        return null;
    }
}