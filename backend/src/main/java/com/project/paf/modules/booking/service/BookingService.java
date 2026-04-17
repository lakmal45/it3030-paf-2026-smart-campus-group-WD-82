package com.project.paf.modules.booking.service;

import com.project.paf.modules.booking.entity.Booking;
import com.project.paf.modules.booking.entity.BookingStatus;
import com.project.paf.modules.booking.repository.BookingRepository;
import com.project.paf.modules.user.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
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

        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                resource, date, startTime, endTime, BookingStatus.CANCELLED);

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Time conflict with an existing confirmed booking.");
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
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get all bookings (Admin/Manager overview).
     */
    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithUser();
    }

    /**
     * Update an existing booking (Admin/Manager control).
     */
    public Booking updateBooking(Long id, String resource, LocalDate date, LocalTime startTime, LocalTime endTime, String statusStr) {
        Booking booking = bookingRepository.findByIdWithUser(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        // Check for conflicts excluding this specific booking
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resource, date, startTime, endTime, BookingStatus.CANCELLED);
        boolean realConflict = conflicts.stream().anyMatch(b -> !b.getId().equals(id));
        
        if (realConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot update: Conflicting reservation exists.");
        }

        booking.setResource(resource);
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        
        if (statusStr != null) {
            try {
                booking.setStatus(BookingStatus.valueOf(statusStr.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid booking status.");
            }
        }

        return bookingRepository.save(booking);
    }

    /**
     * Delete a booking records permanently.
     */
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    /**
     * Cancel a booking by the owning user.
     */
    public Booking cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findByIdWithUser(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Unauthorized cancellation attempt.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
