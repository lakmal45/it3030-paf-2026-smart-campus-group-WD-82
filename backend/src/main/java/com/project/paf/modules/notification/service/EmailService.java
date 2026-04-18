package com.project.paf.modules.notification.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import com.project.paf.modules.notification.model.EmailTemplates;
import com.project.paf.modules.user.model.User;
import com.project.paf.ticket.IncidentTicket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service responsible for sending all outbound notification emails
 * via Spring Mail SMTP.
 *
 * <p>Using the API instead of SMTP removes trial-account recipient
 * restrictions and is more reliable overall.
 *
 * <p>Every public method is annotated with {@code @Async("emailTaskExecutor")}
 * so delivery is performed on a background thread and never delays
 * the HTTP response to the caller.
 *
 * <p>If sending fails the error is logged but <em>not</em> propagated —
 * email delivery is best-effort and must not break core operations.
 */
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppNotificationService appNotificationService;

    public EmailService(JavaMailSender mailSender, AppNotificationService appNotificationService) {
        this.mailSender = mailSender;
        this.appNotificationService = appNotificationService;
    }

    @Value("${mailersend.from-address}")
    private String fromAddress;

    @Value("${mailersend.from-name}")
    private String fromName;

    // ─────────────────────────────────────────────────────────────────────────
    // Generic send helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sends an HTML email via the MailerSend REST API.
     *
     * @param to          recipient email address
     * @param toName      recipient display name (can be same as email if unknown)
     * @param subject     email subject line
     * @param htmlContent HTML body
     */
    @Async("emailTaskExecutor")
    public void sendHtmlEmail(String to, String toName, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent via SMTP to '{}' | subject: '{}'", to, subject);

        } catch (Exception e) {
            log.error("Unexpected error sending SMTP email to '{}': {}", to, e.getMessage(), e);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Account / Welcome notifications
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Sends a welcome email when a new user account is created.
     * Works for both normal (email/password) registration and first-time Google OAuth login.
     *
     * @param name           the new user's display name
     * @param email          the new user's email address
     * @param isGoogleSignup {@code true} if the account was created via Google OAuth
     */
    @Async("emailTaskExecutor")
    public void notifyWelcome(String name, String email, boolean isGoogleSignup) {
        if (email == null || email.isBlank()) {
            log.warn("Cannot send welcome email: email is blank");
            return;
        }
        String subject = "👋 Welcome to Smart Campus, " + name + "!";
        String html    = EmailTemplates.welcomeEmail(name, email, isGoogleSignup);
        sendHtmlEmail(email, name, subject, html);
        log.info("Welcome notification queued for '{}' (Google={})", email, isGoogleSignup);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Ticket event notifications
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Notifies the ticket creator that their incident report has been received.
     *
     * @param ticket the newly created {@link IncidentTicket}
     */
    @Async("emailTaskExecutor")
    public void notifyTicketCreated(IncidentTicket ticket) {
        if (ticket.getCreatedBy() == null || ticket.getCreatedBy().getEmail() == null) {
            log.warn("Cannot send ticket-created email: no creator email for ticket #{}", ticket.getId());
            return;
        }

        // Create in-app notification (always)
        appNotificationService.createNotification(ticket.getCreatedBy(),
            "Ticket Received",
            "Your ticket #" + ticket.getId() + " has been received.",
            "info");

        // Only send email if user has email notifications enabled
        if (!ticket.getCreatedBy().isEmailNotificationsEnabled()) {
            log.info("Email notifications disabled for '{}'; skipping ticket-created email", ticket.getCreatedBy().getEmail());
            return;
        }
        String to      = ticket.getCreatedBy().getEmail();
        String name    = ticket.getCreatedBy().getName();
        String subject = "🎫 Ticket #" + ticket.getId() + " Received — Smart Campus";
        String html    = EmailTemplates.ticketCreated(ticket);
        sendHtmlEmail(to, name, subject, html);
        log.info("Ticket-created notification queued for '{}'", to);
    }

    /**
     * Notifies the ticket creator that the status of their ticket has changed.
     *
     * @param ticket    the ticket after the status update
     * @param oldStatus the status before the update
     */
    @Async("emailTaskExecutor")
    public void notifyStatusChange(IncidentTicket ticket, com.project.paf.ticket.TicketStatus oldStatus) {
        if (ticket.getCreatedBy() == null || ticket.getCreatedBy().getEmail() == null) {
            log.warn("Cannot send status-change email: no creator email for ticket #{}", ticket.getId());
            return;
        }

        // Create in-app notification (always)
        appNotificationService.createNotification(ticket.getCreatedBy(),
            "Ticket Status Updated",
            "Ticket #" + ticket.getId() + " status changed to " + ticket.getStatus().name() + ".",
            "warning");

        // Only send email if user has email notifications enabled
        if (!ticket.getCreatedBy().isEmailNotificationsEnabled()) {
            log.info("Email notifications disabled for '{}'; skipping status-change email", ticket.getCreatedBy().getEmail());
            return;
        }
        String to      = ticket.getCreatedBy().getEmail();
        String name    = ticket.getCreatedBy().getName();
        String subject = "🔔 Ticket #" + ticket.getId() + " Status Updated → "
                         + ticket.getStatus().name() + " — Smart Campus";
        String html    = EmailTemplates.statusChanged(ticket, oldStatus.name());
        sendHtmlEmail(to, name, subject, html);
        log.info("Status-change notification queued for '{}' (#{}: {} → {})",
                to, ticket.getId(), oldStatus, ticket.getStatus());
    }

    /**
     * Notifies the assigned technician that they have a new ticket to work on.
     *
     * @param ticket     the ticket that was just assigned
     * @param technician the {@link User} who was assigned
     */
    @Async("emailTaskExecutor")
    public void notifyTechnicianAssigned(IncidentTicket ticket, User technician) {
        if (technician == null || technician.getEmail() == null) {
            log.warn("Cannot send technician-assigned email: technician has no email for ticket #{}",
                    ticket.getId());
            return;
        }

        // Create in-app notification (always)
        appNotificationService.createNotification(technician,
            "New Ticket Assigned",
            "You have been assigned to ticket #" + ticket.getId() + ".",
            "info");

        // Only send email if technician has email notifications enabled
        if (!technician.isEmailNotificationsEnabled()) {
            log.info("Email notifications disabled for '{}'; skipping technician-assigned email", technician.getEmail());
            return;
        }
        String to      = technician.getEmail();
        String name    = technician.getName();
        String subject = "🔧 New Assignment: Ticket #" + ticket.getId() + " — Smart Campus";
        String html    = EmailTemplates.technicianAssigned(ticket, technician);
        sendHtmlEmail(to, name, subject, html);
        log.info("Technician-assigned notification queued for '{}' (ticket #{})",
                to, ticket.getId());
    }

    /**
     * Notifies all admins and managers when a new ticket is submitted.
     *
     * @param ticket            the newly created ticket
     * @param adminsAndManagers the list of User entities with ADMIN or MANAGER roles
     */
    @Async("emailTaskExecutor")
    public void notifyAdminsAndManagersNewTicket(IncidentTicket ticket, List<User> adminsAndManagers) {
        for (User user : adminsAndManagers) {
            if (user.getEmail() == null) continue;

            // Create in-app notification (always, regardless of email preference)
            appNotificationService.createNotification(user,
                "New Ticket Reported",
                "A new ticket #" + ticket.getId() + " has been reported by " + ticket.getCreatedBy().getName() + ".",
                "alert");

            // Only send email if this admin/manager has email notifications enabled
            if (!user.isEmailNotificationsEnabled()) {
                log.info("Email notifications disabled for '{}'; skipping new-ticket admin email", user.getEmail());
                continue;
            }
            String to      = user.getEmail();
            String name    = user.getName();
            String subject = "🚨 New Ticket #" + ticket.getId() + " Reported — Smart Campus";
            String html    = EmailTemplates.adminNewTicket(ticket);
            sendHtmlEmail(to, name, subject, html);
            log.info("New ticket notification queued for admin/manager '{}'", to);
        }
    }

    /**
     * Notifies the ticket creator that an admin or manager has added a comment
     * to their ticket.
     *
     * @param ticket    the ticket that received the comment
     * @param comment   the newly added {@link com.project.paf.ticket.TicketComment}
     * @param commenter the admin/manager who wrote the comment
     */
    @Async("emailTaskExecutor")
    public void notifyCommentAdded(IncidentTicket ticket,
                                   com.project.paf.ticket.TicketComment comment,
                                   User commenter) {
        if (ticket.getCreatedBy() == null || ticket.getCreatedBy().getEmail() == null) {
            log.warn("Cannot send comment-added email: no creator email for ticket #{}", ticket.getId());
            return;
        }

        // Create in-app notification for the ticket creator (always)
        appNotificationService.createNotification(ticket.getCreatedBy(),
            "New Comment on Your Ticket",
            commenter.getName() + " commented on your ticket #" + ticket.getId() + ".",
            "info");

        // Only send email if user has email notifications enabled
        if (!ticket.getCreatedBy().isEmailNotificationsEnabled()) {
            log.info("Email notifications disabled for '{}'; skipping comment-added email", ticket.getCreatedBy().getEmail());
            return;
        }
        String to      = ticket.getCreatedBy().getEmail();
        String name    = ticket.getCreatedBy().getName();
        String subject = "💬 New Comment on Ticket #" + ticket.getId() + " — Smart Campus";
        String html    = EmailTemplates.commentAdded(ticket, comment, commenter);
        sendHtmlEmail(to, name, subject, html);
        log.info("Comment-added notification queued for '{}' (ticket #{})", to, ticket.getId());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Booking event notifications
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Notifies the booking creator that their booking request has been received.
     *
     * @param booking the newly created {@link com.project.paf.modules.booking.entity.Booking}
     */
    @Async("emailTaskExecutor")
    public void notifyBookingCreatedToUser(com.project.paf.modules.booking.entity.Booking booking) {
        User user = booking.getUser();
        if (user == null || user.getEmail() == null) {
            log.warn("Cannot send booking-created email: no user email for booking #{}", booking.getId());
            return;
        }

        // Create in-app notification (always)
        appNotificationService.createNotification(user,
            "Booking Request Received",
            "Your booking request #" + booking.getId() + " for " + booking.getResource() + " has been received and is pending review.",
            "info");

        // Only send email if user has email notifications enabled
        if (!user.isEmailNotificationsEnabled()) {
            log.info("Email notifications disabled for '{}'; skipping booking-created email", user.getEmail());
            return;
        }
        String to      = user.getEmail();
        String name    = user.getName();
        String subject = "📅 Booking #" + booking.getId() + " Request Received — Smart Campus";
        String html    = EmailTemplates.bookingCreatedUser(booking, name);
        sendHtmlEmail(to, name, subject, html);
        log.info("Booking-created notification queued for '{}'", to);
    }

    /**
     * Notifies all admins and managers when a new booking is submitted.
     *
     * @param booking           the newly created booking
     * @param adminsAndManagers the list of User entities with ADMIN or MANAGER roles
     */
    @Async("emailTaskExecutor")
    public void notifyBookingCreatedToAdmins(com.project.paf.modules.booking.entity.Booking booking, List<User> adminsAndManagers) {
        String userName = booking.getUser() != null ? booking.getUser().getName() : "Unknown User";
        for (User user : adminsAndManagers) {
            if (user.getEmail() == null) continue;

            // Create in-app notification (always, regardless of email preference)
            appNotificationService.createNotification(user,
                "New Booking Request",
                "A new booking request #" + booking.getId() + " has been submitted by " + userName + " for " + booking.getResource() + ".",
                "alert");

            // Only send email if this admin/manager has email notifications enabled
            if (!user.isEmailNotificationsEnabled()) {
                log.info("Email notifications disabled for '{}'; skipping new-booking admin email", user.getEmail());
                continue;
            }
            String to      = user.getEmail();
            String name    = user.getName();
            String subject = "🗓️ New Booking #" + booking.getId() + " Request — Smart Campus";
            String html    = EmailTemplates.adminNewBooking(booking, userName);
            sendHtmlEmail(to, name, subject, html);
            log.info("New booking notification queued for admin/manager '{}'", to);
        }
    }

    /**
     * Notifies the booking creator that their booking has been confirmed.
     *
     * @param booking the confirmed {@link com.project.paf.modules.booking.entity.Booking}
     */
    @Async("emailTaskExecutor")
    public void notifyBookingConfirmed(com.project.paf.modules.booking.entity.Booking booking) {
        User user = booking.getUser();
        if (user == null || user.getEmail() == null) {
            log.warn("Cannot send booking-confirmed email: no user email for booking #{}", booking.getId());
            return;
        }

        // Create in-app notification (always)
        appNotificationService.createNotification(user,
            "Booking Confirmed ✅",
            "Your booking #" + booking.getId() + " for " + booking.getResource() + " on " + booking.getDate() + " has been confirmed.",
            "success");

        // Only send email if user has email notifications enabled
        if (!user.isEmailNotificationsEnabled()) {
            log.info("Email notifications disabled for '{}'; skipping booking-confirmed email", user.getEmail());
            return;
        }
        String to      = user.getEmail();
        String name    = user.getName();
        String subject = "✅ Booking #" + booking.getId() + " Confirmed — Smart Campus";
        String html    = EmailTemplates.bookingConfirmed(booking, name);
        sendHtmlEmail(to, name, subject, html);
        log.info("Booking-confirmed notification queued for '{}'", to);
    }

    /**
     * Notifies the booking creator that their booking has been cancelled.
     *
     * @param booking     the cancelled {@link com.project.paf.modules.booking.entity.Booking}
     * @param cancelledBy a human-readable description of who cancelled it (e.g., "you" or "an administrator")
     */
    @Async("emailTaskExecutor")
    public void notifyBookingCancelled(com.project.paf.modules.booking.entity.Booking booking, String cancelledBy) {
        User user = booking.getUser();
        if (user == null || user.getEmail() == null) {
            log.warn("Cannot send booking-cancelled email: no user email for booking #{}", booking.getId());
            return;
        }

        // Create in-app notification (always)
        appNotificationService.createNotification(user,
            "Booking Cancelled",
            "Your booking #" + booking.getId() + " for " + booking.getResource() + " has been cancelled by " + cancelledBy + ".",
            "warning");

        // Only send email if user has email notifications enabled
        if (!user.isEmailNotificationsEnabled()) {
            log.info("Email notifications disabled for '{}'; skipping booking-cancelled email", user.getEmail());
            return;
        }
        String to      = user.getEmail();
        String name    = user.getName();
        String subject = "❌ Booking #" + booking.getId() + " Cancelled — Smart Campus";
        String html    = EmailTemplates.bookingCancelled(booking, name, cancelledBy);
        sendHtmlEmail(to, name, subject, html);
        log.info("Booking-cancelled notification queued for '{}'", to);
    }
}
