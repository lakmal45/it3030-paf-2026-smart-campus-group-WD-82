package com.project.paf.modules.auditlog;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO returned to the frontend for each audit log entry.
 */
@Getter
@Setter
public class AuditLogDTO {

    private Long id;
    private String action;
    private String actionLabel;   // Human-friendly label, e.g. "Booking Confirmed"
    private String category;      // BOOKING | TICKET | USER | RESOURCE
    private String actorName;
    private String actorRole;
    private String targetDescription;
    private String entityType;
    private Long entityId;
    private LocalDateTime createdAt;
}
