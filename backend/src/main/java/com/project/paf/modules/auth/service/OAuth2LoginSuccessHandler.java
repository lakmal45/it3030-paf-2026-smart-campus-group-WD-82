package com.project.paf.modules.auth.service;

import com.project.paf.modules.user.model.Role;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    public OAuth2LoginSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String profileImageUrl = oAuth2User.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        // Create user if first-time Google login
        if (existingUser.isEmpty()) {

            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPassword(null); // Google users have no local password

            // default role
            user.setRole(Role.USER);
        } else {
            user = existingUser.get();
        }

        user.setName(name);
        user.setProfileImageUrl(profileImageUrl);
        user = userRepository.save(user);
        request.getSession().setAttribute("user", user);

        // Get role from database
        String role = user.getRole().name();

        response.sendRedirect(
                "http://localhost:5173/oauth-success?email="
                        + encodeParam(email) +
                        "&name="
                        + encodeParam(name)
                        + "&role=" + encodeParam(role)
                        + "&profileImageUrl=" + encodeParam(profileImageUrl)
        );
    }

    private String encodeParam(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
