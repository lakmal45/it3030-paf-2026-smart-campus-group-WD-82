package com.project.paf.modules.booking;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * One-time schema fix: drops the legacy 'time' column from the bookings table.
 * The column was replaced by 'start_time' and 'end_time'.
 * Safe to remove this class once the migration has run on all environments.
 */
@Slf4j
@Component
public class BookingSchemaFix {

    private final JdbcTemplate jdbcTemplate;

    public BookingSchemaFix(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void dropLegacyTimeColumn() {
        try {
            // Check if the old 'time' column still exists
            var columns = jdbcTemplate.queryForList(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'time'");

            if (!columns.isEmpty()) {
                jdbcTemplate.execute("ALTER TABLE bookings DROP COLUMN `time`");
                log.info("Dropped legacy 'time' column from bookings table.");
            }
        } catch (Exception e) {
            log.warn("Could not drop legacy 'time' column (may already be removed): {}", e.getMessage());
        }
    }
}
