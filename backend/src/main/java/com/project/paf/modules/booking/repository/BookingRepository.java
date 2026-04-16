package com.project.paf.modules.booking.repository;

import com.project.paf.modules.booking.entity.Booking;
import com.project.paf.modules.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find bookings that overlap with a given time range on the same resource and date.
     * Two bookings overlap when: existingStart < newEnd AND existingEnd > newStart.
     * Cancelled bookings are excluded from conflict checks.
     */
    @Query("SELECT b FROM Booking b WHERE b.resource = :resource AND b.date = :date " +
           "AND b.status <> :excludedStatus " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(
            @Param("resource") String resource,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludedStatus") BookingStatus excludedStatus);
}
