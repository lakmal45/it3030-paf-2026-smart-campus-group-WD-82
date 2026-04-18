package com.project.paf.modules.resource.controller;

import com.project.paf.modules.resource.dto.ResourceRequestDTO;
import com.project.paf.modules.resource.dto.ResourceResponseDTO;
import com.project.paf.modules.resource.model.ResourceStatus;
import com.project.paf.modules.resource.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "Resource Management", description = "Endpoints for managing campus resources like rooms, labs, and equipment")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    @Operation(summary = "Get all resources", description = "Retrieves a complete list of all campus resources")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list")
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID", description = "Retrieves details of a specific resource using its ID")
    @ApiResponse(responseCode = "200", description = "Resource found")
    @ApiResponse(responseCode = "404", description = "Resource not found")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new resource", description = "Adds a new resource to the campus catalogue (Admin only)")
    @ApiResponse(responseCode = "201", description = "Resource created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<ResourceResponseDTO> createResource(@Valid @RequestBody ResourceRequestDTO requestDTO) {
        ResourceResponseDTO created = resourceService.createResource(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing resource", description = "Modifies an existing resource's details (Admin only)")
    @ApiResponse(responseCode = "200", description = "Resource updated successfully")
    @ApiResponse(responseCode = "404", description = "Resource not found")
    public ResponseEntity<ResourceResponseDTO> updateResource(@PathVariable @NonNull Long id, @Valid @RequestBody ResourceRequestDTO requestDTO) {
        return ResponseEntity.ok(resourceService.updateResource(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a resource", description = "Removes a resource from the system (Admin only)")
    @ApiResponse(responseCode = "204", description = "Resource deleted successfully")
    @ApiResponse(responseCode = "404", description = "Resource not found")
    public ResponseEntity<Void> deleteResource(@PathVariable @NonNull Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search resources", description = "Filters resources by name, type, location, and availability")
    @ApiResponse(responseCode = "200", description = "Search results returned")
    public ResponseEntity<List<ResourceResponseDTO>> searchResources(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) Boolean available
    ) {
        return ResponseEntity.ok(resourceService.getFilteredResources(name, type, location, capacity, available));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update resource status", description = "Toggles resource status (Admin only)")
    @ApiResponse(responseCode = "200", description = "Status updated successfully")
    public ResponseEntity<ResourceResponseDTO> updateStatus(
            @PathVariable @NonNull Long id,
            @RequestParam ResourceStatus status
    ) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }
}
