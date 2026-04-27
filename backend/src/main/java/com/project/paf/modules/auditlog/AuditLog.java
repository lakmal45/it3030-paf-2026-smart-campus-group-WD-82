package com.project.paf.modules.auditlog;

import com.project.paf.modules.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Persistent record of a single system action.
 * Actor details are denormalized (name, role) so audit entries remain
 * meaningful even after a user account is deleted.
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_created_at", columnList = "created_at"),
        @Index(name = "idx_audit_category",   columnList = "category"),
        @Index(name = "idx_audit_actor_id",   columnList = "actor_id")
})
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The type of action performed. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AuditAction action;

    /** High-level group: BOOKING | TICKET | USER | RESOURCE. */
    @Column(nullable = false, length = 50)
    private String category;

    /** The user who performed the action (nullable — system-generated events). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    /** Denormalized actor name, so it survives user deletion. */
    @Column(length = 255)
    private String actorName;

    /** Denormalized actor role at time of action. */
    @Column(length = 50)
    private String actorRole;

    /** Human-readable description of what was affected. */
    @Column(columnDefinition = "TEXT")
    private String targetDescription;

    /** Entity type that was affected, e.g. "Booking", "Ticket". */
    @Column(length = 50)
    private String entityType;

    /** Primary key of the affected entity. */
    private Long entityId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
