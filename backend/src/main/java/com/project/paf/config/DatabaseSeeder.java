package com.project.paf.config;

import com.project.paf.modules.user.model.Role;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class DatabaseSeeder {

    /**
     * Safe Data Seeder: Runs on startup to ensure you always have an Admin account.
     * This is an isolated initialization and does not modify any of your feature code.
     */
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // ── 1. Elevate your local account (from your screenshot) ─────────
            syncAdmin(userRepository, "aga.lochana@gmail.com", "Kavindu Kalhara");

            // ── 2. Elevate the master admin email ────────────────────────────
            syncAdmin(userRepository, "admin@campus.com", "System Admin");
            
            System.out.println("✅ DatabaseSeeder: Admin accounts synchronized successfully.");
        };
    }

    private void syncAdmin(UserRepository repo, String email, String name) {
        Optional<User> existingUser = repo.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                repo.save(user);
                System.out.println("🚀 DatabaseSeeder: Upgraded " + email + " to ADMIN.");
            }
        } else {
            // Create a temporary user if they don't exist yet
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole(Role.ADMIN);
            // OAuth2 users findPassword null; we'll set a placeholder if needed
            newUser.setPassword(null); 
            repo.save(newUser);
            System.out.println("✨ DatabaseSeeder: Created new ADMIN user: " + email);
        }
    }
}
