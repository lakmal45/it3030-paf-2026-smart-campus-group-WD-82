package com.project.paf.modules.auditlog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Paginated, filtered query used by the admin UI.
     * All parameters are optional — null means "no filter on that field".
     */
    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:category IS NULL OR a.category = :category)
              AND (:search   IS NULL OR LOWER(a.actorName) LIKE LOWER(CONCAT('%', :search, '%'))
                                    OR LOWER(a.targetDescription) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:from IS NULL OR a.createdAt >= :from)
              AND (:to   IS NULL OR a.createdAt <= :to)
            ORDER BY a.createdAt DESC
            """)
    Page<AuditLog> findFiltered(
            @Param("category") String category,
            @Param("search")   String search,
            @Param("from")     LocalDateTime from,
            @Param("to")       LocalDateTime to,
            Pageable pageable
    );

    /** Count of events per category — used for stats cards. */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.category = :category")
    long countByCategory(@Param("category") String category);

    /** Purge all log entries older than the given cutoff — called by the 30-day scheduler. */
    @Modifying
    @Query("DELETE FROM AuditLog a WHERE a.createdAt < :cutoff")
    int deleteOlderThan(@Param("cutoff") LocalDateTime cutoff);
}
