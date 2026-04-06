package com.project.paf.modules.auth.controller;

import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AuthController {

    private final UserService service;

    public AuthController(UserService service) {
        this.service = service;
    }

    // REGISTER
    @PostMapping("/signup")
    public User signup(@RequestBody User user) {
        return service.register(user);
    }

    // LOGIN
    @PostMapping("/login")
    public User login(@RequestBody User request, HttpSession session) {

        User user = service.login(request.getEmail(), request.getPassword());

        session.setAttribute("user", user);

        return user;
    }
}