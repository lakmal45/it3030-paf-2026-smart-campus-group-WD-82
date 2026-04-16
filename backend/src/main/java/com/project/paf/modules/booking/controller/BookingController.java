package com.project.paf.modules.booking.controller;

import com.project.paf.modules.booking.entity.Booking;
import com.project.paf.modules.booking.service.BookingService;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    /**
     * POST /api/bookings — Create a new booking.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(
            @RequestBody Map<String, String> request,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        User currentUser = resolveUser(session, emailHeader);

        String resource = request.get("resource");
        String dateStr = request.get("date");
        String startTimeStr = request.get("startTime");
        String endTimeStr = request.get("endTime");
        String reason = request.get("reason");

        if (resource == null || dateStr == null || startTimeStr == null || endTimeStr == null || reason == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All fields are required");
        }

        LocalDate date = LocalDate.parse(dateStr);
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        Booking booking = bookingService.createBooking(resource, date, startTime, endTime, reason, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(booking));
    }

    /**
     * GET /api/bookings/my — Get bookings for the current user.
     */
    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyBookings(
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        User currentUser = resolveUser(session, emailHeader);
        List<Booking> bookings = bookingService.getBookingsByUser(currentUser.getId());
        List<Map<String, Object>> response = bookings.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/bookings/{id}/cancel — Cancel a booking.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(
            @PathVariable Long id,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {

        User currentUser = resolveUser(session, emailHeader);
        Booking booking = bookingService.cancelBooking(id, currentUser);
        return ResponseEntity.ok(toResponse(booking));
    }

    /**
     * Convert Booking entity to a response map (avoids lazy-load serialization issues).
     */
    private Map<String, Object> toResponse(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", booking.getId());
        map.put("resource", booking.getResource());
        map.put("date", booking.getDate().toString());
        map.put("startTime", booking.getStartTime().toString());
        map.put("endTime", booking.getEndTime().toString());
        map.put("reason", booking.getReason());
        map.put("status", booking.getStatus().name());
        map.put("createdAt", booking.getCreatedAt().toString());
        map.put("userName", booking.getUser().getName());
        return map;
    }

    /**
     * Resolves the current User from either the session or the X-User-Email header.
     */
    private User resolveUser(HttpSession session, String emailHeader) {
        User resolved = null;

        Object sessionAttr = session.getAttribute("user");
        if (sessionAttr instanceof User) {
            resolved = (User) sessionAttr;
        }

        if (resolved == null && emailHeader != null && !emailHeader.isBlank()) {
            resolved = userRepository.findByEmail(emailHeader).orElse(null);
        }

        if (resolved == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return resolved;
    }
}
