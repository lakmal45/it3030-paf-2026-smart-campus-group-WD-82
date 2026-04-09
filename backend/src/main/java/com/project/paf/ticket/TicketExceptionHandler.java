package com.project.paf.ticket;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Supplementary exception handler for the ticket module.
 *
 * <p>Handles exceptions not already covered by the global
 * {@code GlobalExceptionHandler}: specifically {@link IllegalStateException}
 * (invalid status transitions / business rule violations) and
 * {@link AccessDeniedException} (ownership failures in the service layer).
 *
 * <p>Note: {@code ResourceNotFoundException} and
 * {@code MethodArgumentNotValidException} are already handled by
 * {@code GlobalExceptionHandler} and do not need to be repeated here.
 */
@RestControllerAdvice(basePackages = "com.project.paf.ticket")
public class TicketExceptionHandler {

    /**
     * Handles invalid status transitions and other business-rule violations.
     * Returns 400 Bad Request.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "timestamp", LocalDateTime.now().toString(),
                        "status", HttpStatus.BAD_REQUEST.value(),
                        "error", "Bad Request",
                        "message", ex.getMessage()
                ));
    }

    /**
     * Handles ownership violations (e.g. a user trying to edit another user's comment).
     * Returns 403 Forbidden.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "timestamp", LocalDateTime.now().toString(),
                        "status", HttpStatus.FORBIDDEN.value(),
                        "error", "Forbidden",
                        "message", ex.getMessage()
                ));
    }
}
