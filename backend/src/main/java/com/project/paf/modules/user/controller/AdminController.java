package com.project.paf.modules.user.controller;

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

    public AdminController(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
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
        return ResponseEntity.ok(repo.save(user));
    }

    // ── DELETE user ───────────────────────────────────────────────────────────
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable @NonNull Long id,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        requireAdmin(session, emailHeader);
        repo.deleteById(java.util.Objects.requireNonNull(id));
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

        if (name == null || name.isBlank() || email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and email are required");
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

        // Return saved user info + the plain-text password (shown once to admin)
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        response.put("role", saved.getRole().name());
        response.put("generatedPassword", plainPassword);

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
}