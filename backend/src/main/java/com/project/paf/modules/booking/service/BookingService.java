package com.project.paf.modules.booking.service;

import com.project.paf.modules.booking.entity.Booking;
import com.project.paf.modules.booking.entity.BookingStatus;
import com.project.paf.modules.booking.repository.BookingRepository;
import com.project.paf.modules.user.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Create a new booking for the given user.
     * Checks for time-slot conflicts before saving.
     */
    public Booking createBooking(String resource, LocalDate date, LocalTime startTime,
                                  LocalTime endTime, String reason, User user) {

        // Validate that end time is after start time
        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        // Check for conflicting bookings (exclude CANCELLED)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource, date, startTime, endTime, BookingStatus.CANCELLED);

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This resource is already booked during the selected time slot");
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setReason(reason);
        booking.setStatus(BookingStatus.PENDING);
        booking.setUser(user);
        return bookingRepository.save(booking);
    }

    /**
     * Get all bookings belonging to a specific user.
     */
    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get all bookings (for admin/manager).
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    /**
     * Cancel a booking. Only the owner can cancel their own booking.
     */
    public Booking cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
