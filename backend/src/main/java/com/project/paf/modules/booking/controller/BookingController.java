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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incomplete booking data provided.");
        }

        LocalDate date = LocalDate.parse(dateStr);
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        Booking booking = bookingService.createBooking(resource, date, startTime, endTime, reason, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(booking));
    }

    /**
     * GET /api/bookings/my — Retrieve current user's reservations.
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
     * GET /api/bookings — Retrieve global schedule (Admin only).
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        List<Map<String, Object>> response = bookings.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/bookings/{id} — Administrative update of reservation details.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String resource = request.get("resource");
        String dateStr = request.get("date");
        String startTimeStr = request.get("startTime");
        String endTimeStr = request.get("endTime");
        String status = request.get("status");

        if (dateStr == null || startTimeStr == null || endTimeStr == null || resource == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required fields missing for update.");
        }

        LocalDate date = LocalDate.parse(dateStr);
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        Booking updatedBooking = bookingService.updateBooking(id, resource, date, startTime, endTime, status);
        return ResponseEntity.ok(toResponse(updatedBooking));
    }

    /**
     * DELETE /api/bookings/{id} — Permanent removal of a record.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/bookings/{id}/cancel — User-initiated cancellation.
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
     * Map entity to response JSON safely.
     */
    private Map<String, Object> toResponse(Booking booking) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", booking.getId());
        map.put("resource", booking.getResource());
        map.put("date", booking.getDate() != null ? booking.getDate().toString() : null);
        map.put("startTime", booking.getStartTime() != null ? booking.getStartTime().toString() : null);
        map.put("endTime", booking.getEndTime() != null ? booking.getEndTime().toString() : null);
        map.put("reason", booking.getReason());
        map.put("status", booking.getStatus() != null ? booking.getStatus().name() : "PENDING");
        map.put("createdAt", booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null);
        map.put("userName", booking.getUser() != null ? booking.getUser().getName() : "Archived User");
        return map;
    }

    /**
     * Identity Resolution.
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
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Security: Session expired or missing.");
        }
        return resolved;
    }
}
