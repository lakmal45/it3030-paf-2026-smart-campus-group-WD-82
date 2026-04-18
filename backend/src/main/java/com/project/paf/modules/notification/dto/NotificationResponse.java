package com.project.paf.modules.notification.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type; // info, success, warning, alert
    private boolean isRead;
    private LocalDateTime createdAt;
    private String timeAgo; // Helper string like "2m ago"
    private String link;
}
