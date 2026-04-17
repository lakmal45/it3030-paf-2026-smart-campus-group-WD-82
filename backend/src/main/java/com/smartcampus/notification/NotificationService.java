package com.smartcampus.notification;

import com.project.paf.modules.user.model.User;
import org.springframework.stereotype.Service;

/**
 * Service for sending notifications.
 */
@Service
public class NotificationService {

    /**
     * Sends a notification to a specific user.
     *
     * @param recipient the user to receive the notification
     * @param message   the notification message content
     * @param type      the type/category of the notification
     */
    public void sendNotification(User recipient, String message, String type) {
        // Implementation provided by Team Member 4
        System.out.println("Mock Notification sent to " + recipient.getEmail() + " | Type: " + type + " | Message: " + message);
    }
}
