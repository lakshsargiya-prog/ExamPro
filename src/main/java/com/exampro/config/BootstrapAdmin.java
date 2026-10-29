package com.exampro.config;

import com.exampro.entity.AppUser;
import com.exampro.entity.Role;
import com.exampro.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapAdmin {

    private static final Logger log = LoggerFactory.getLogger(BootstrapAdmin.class);

    @Bean
    CommandLineRunner createAdmin(
            UserRepository users,
            PasswordEncoder encoder,
            @Value("${ADMIN_EMAIL:${app.admin.email:}}") String email,
            @Value("${ADMIN_PASSWORD:${app.admin.password:}}") String password,
            @Value("${ADMIN_NAME:${app.admin.name:ExamPro Administrator}}") String name) {
        return args -> provisionAdmin(users, encoder, email, password, name);
    }

    public static boolean provisionAdmin(
            UserRepository users,
            PasswordEncoder encoder,
            String email,
            String password,
            String name) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.info("Admin bootstrap: No initial ADMIN_EMAIL or ADMIN_PASSWORD configured. Skipping admin provisioning.");
            return false;
        }

        String normalizedEmail = email.trim().toLowerCase();

        if (users.existsByEmailIgnoreCase(normalizedEmail)) {
            log.info("Admin bootstrap: Account already exists for '{}'. Existing account will not be overwritten or modified.", normalizedEmail);
            return false;
        }

        if (password.length() < 8) {
            log.warn("Admin bootstrap: ADMIN_PASSWORD must be at least 8 characters. Admin provisioning skipped.");
            return false;
        }

        AppUser admin = new AppUser();
        admin.setFullName(name != null && !name.isBlank() ? name.trim() : "ExamPro Administrator");
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(encoder.encode(password));
        admin.setRole(Role.ADMIN);
        users.save(admin);

        log.info("Admin bootstrap: Initial ADMIN account successfully provisioned for '{}'.", normalizedEmail);
        return true;
    }
}
