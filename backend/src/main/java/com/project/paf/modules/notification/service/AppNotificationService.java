package com.project.paf.modules.notification.service;

import com.project.paf.modules.notification.dto.NotificationResponse;
import com.project.paf.modules.notification.model.Notification;
import com.project.paf.modules.notification.repository.NotificationRepository;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.resource.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class AppNotificationService {

    private final NotificationRepository notificationRepository;

    public AppNotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Creates and saves a new in-app notification.
     * Can be run asynchronously to avoid blocking the caller.
     */
    @Async("emailTaskExecutor")
    public void createNotification(User targetUser, String title, String message, String type) {
        if (targetUser == null) return;

        // Respect the user's push notification preference
        if (!targetUser.isPushNotificationsEnabled()) {
            log.info("Push notifications disabled for user ID {}; skipping in-app notification: {}",
                    targetUser.getId(), title);
            return;
        }

        Notification notification = new Notification();
        notification.setTargetUser(targetUser);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type); // "info", "success", "warning", "alert"
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationRepository.save(notification);
        log.info("Created in-app notification for user ID {}: {}", targetUser.getId(), title);
    }

    /**
     * Fetches all notifications for a specific user, ordered by most recent.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByTargetUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves the count of unread notifications for a user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByTargetUserAndIsReadFalse(user);
    }

    /**
     * Marks a single notification as read.
     * Verifies that the notification belongs to the calling user.
     */
    public void markAsRead(@NonNull Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
                
        if (!notification.getTargetUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this notification");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Marks all unread notifications for a user as read.
     */
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByTargetUserOrderByCreatedAtDesc(user);
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(java.util.Objects.requireNonNull(notifications));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        response.setLink(notification.getLink());
        
        // Compute a simple timeAgo string safely
        response.setTimeAgo(computeTimeAgo(notification.getCreatedAt()));
        
        return response;
    }

    private String computeTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(createdAt, now);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = ChronoUnit.HOURS.between(createdAt, now);
        if (hours < 24) return hours + "h ago";
        long days = ChronoUnit.DAYS.between(createdAt, now);
        return days + "d ago";
    }
}
