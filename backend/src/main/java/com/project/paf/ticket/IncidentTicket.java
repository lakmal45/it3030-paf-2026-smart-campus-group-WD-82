package com.project.paf.ticket;

import com.project.paf.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a maintenance or incident ticket raised by a campus user.
 */
@Getter
@Setter
@Entity
@Table(name = "incident_tickets")
public class IncidentTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who created this ticket. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    /** Optional reference to a campus resource/location ID from the resource catalogue. */
    private String resourceId;

    @Column(nullable = false)
    private String location;

    /**
     * Category of the incident.
     * Expected values: ELECTRICAL, PLUMBING, EQUIPMENT, STRUCTURAL, OTHER
     */
    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 1000)
    private String description;

    /**
     * Priority level.
     * Expected values: LOW, MEDIUM, HIGH, CRITICAL
     */
    @Column(nullable = false, length = 20)
    private String priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.OPEN;

    /**
     * Relative file paths for uploaded images (max 3).
     * Stored as a separate collection table.
     */
    @ElementCollection
    @CollectionTable(name = "ticket_image_urls", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    /** Technician assigned to handle this ticket (nullable). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    /** Notes added by the technician or admin when resolving/closing. */
    @Column(length = 2000)
    private String resolutionNotes;

    /** How the reporter prefers to be contacted (e.g. email, phone). */
    private String preferredContact;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
