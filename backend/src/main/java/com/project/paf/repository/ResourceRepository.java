package com.project.paf.repository;

import com.project.paf.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
