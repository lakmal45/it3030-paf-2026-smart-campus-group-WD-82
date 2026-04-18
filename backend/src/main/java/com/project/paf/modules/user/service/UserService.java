package com.project.paf.modules.user.service;

import com.project.paf.modules.notification.service.EmailService;
import com.project.paf.modules.user.model.Role;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final EmailService emailService;

    public UserService(UserRepository repo, PasswordEncoder encoder, EmailService emailService) {
        this.repo = repo;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    public User register(User user) {

        user.setPassword(encoder.encode(user.getPassword()));

        // default role
        user.setRole(Role.USER);

        User saved = repo.save(user);

        // Send welcome email (async, best-effort)
        emailService.notifyWelcome(saved.getName(), saved.getEmail(), false);

        return saved;
    }

    public User login(String email, String password) {

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null) {
            throw new RuntimeException("This account uses Google Sign-In. Please login with Google.");
        }

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return user;
    }

    public User updateUser(@NonNull Long id, User updateData) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (updateData.getName() != null) user.setName(updateData.getName());
        if (updateData.getProfileImageUrl() != null) user.setProfileImageUrl(updateData.getProfileImageUrl());
        return repo.save(java.util.Objects.requireNonNull(user));
    }

    public void changePassword(@NonNull Long id, String oldPassword, String newPassword) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getPassword() == null) throw new RuntimeException("Google users cannot change password");
        if (!encoder.matches(oldPassword, user.getPassword())) throw new RuntimeException("Old password incorrect");
        user.setPassword(encoder.encode(newPassword));
        repo.save(java.util.Objects.requireNonNull(user));
    }

    public User updateNotificationPrefs(@NonNull Long id, Boolean emailNotificationsEnabled, Boolean pushNotificationsEnabled) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        // Only update fields that were explicitly provided
        if (emailNotificationsEnabled != null) user.setEmailNotificationsEnabled(emailNotificationsEnabled);
        if (pushNotificationsEnabled != null) user.setPushNotificationsEnabled(pushNotificationsEnabled);
        return repo.save(java.util.Objects.requireNonNull(user));
    }

    public void deleteUser(@NonNull Long id) {
        repo.deleteById(id);
    }
}
