package com.project.paf.modules.resource.repository;

import com.project.paf.modules.resource.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByNameContainingIgnoreCase(String name);

    List<Resource> findByTypeContainingIgnoreCase(String type);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer minCapacity);

    List<Resource> findByAvailable(Boolean available);

    List<Resource> findByTypeContainingIgnoreCaseAndLocationContainingIgnoreCaseAndAvailable(
            String type,
            String location,
            Boolean available
    );

        @Query("""
            SELECT r
            FROM Resource r
            WHERE (:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%')))
              AND (:type IS NULL OR LOWER(r.type) LIKE LOWER(CONCAT('%', :type, '%')))
              AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
              AND (:available IS NULL OR r.available = :available)
            """)
        List<Resource> findByFilters(
            @Param("name") String name,
            @Param("type") String type,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity,
            @Param("available") Boolean available
        );
}
