package com.project.paf.modules.resource.controller;

import com.project.paf.modules.resource.dto.ResourceRequestDTO;
import com.project.paf.modules.resource.dto.ResourceResponseDTO;
import com.project.paf.modules.resource.model.ResourceStatus;
import com.project.paf.modules.resource.service.ResourceService;
import com.project.paf.modules.user.model.Role;
import com.project.paf.modules.user.model.User;
import com.project.paf.modules.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "Resource Management", description = "Endpoints for managing campus resources like rooms, labs, and equipment")
public class ResourceController {

    private final ResourceService resourceService;
    private final UserRepository userRepository;

    public ResourceController(ResourceService resourceService, UserRepository userRepository) {
        this.resourceService = resourceService;
        this.userRepository = userRepository;
    }

    /**
     * Hand-rolled Security Guard: aligns with the app's established pattern.
     */
    private void requireAdmin(HttpSession session, String emailHeader) {
        User resolved = null;
        
        // ── 1. Check session ──────────────────────────────────────────────
        Object sessionAttr = session.getAttribute("user");
        if (sessionAttr instanceof User) {
            resolved = (User) sessionAttr;
        }

        // ── 2. Check email header fallback ────────────────────────────────
        if (resolved == null && emailHeader != null && !emailHeader.isBlank()) {
            resolved = userRepository.findByEmail(emailHeader).orElse(null);
            
            // Fallback: If this is the master admin email but not in DB yet, grant virtual access
            if (resolved == null && emailHeader.equalsIgnoreCase("admin@campus.com")) {
                resolved = new User();
                resolved.setEmail("admin@campus.com");
                resolved.setRole(Role.ADMIN);
            }
        }

        if (resolved == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: No valid identity found.");
        }

        // ── 3. Final Role Check ───────────────────────────────────────────
        boolean isMasterAdmin = resolved.getEmail().equalsIgnoreCase("admin@campus.com");
        if (!isMasterAdmin && resolved.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Admin status required.");
        }
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
    @Operation(summary = "Create a new resource", description = "Adds a new resource to the campus catalogue (Admin only)")
    @ApiResponse(responseCode = "201", description = "Resource created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO requestDTO,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {
        requireAdmin(session, emailHeader);
        ResourceResponseDTO created = resourceService.createResource(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing resource", description = "Modifies an existing resource's details (Admin only)")
    @ApiResponse(responseCode = "200", description = "Resource updated successfully")
    @ApiResponse(responseCode = "404", description = "Resource not found")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable @NonNull Long id, 
            @Valid @RequestBody ResourceRequestDTO requestDTO,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {
        requireAdmin(session, emailHeader);
        return ResponseEntity.ok(resourceService.updateResource(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a resource", description = "Removes a resource from the system (Admin only)")
    @ApiResponse(responseCode = "204", description = "Resource deleted successfully")
    @ApiResponse(responseCode = "404", description = "Resource not found")
    public ResponseEntity<Void> deleteResource(
            @PathVariable @NonNull Long id,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader) {
        requireAdmin(session, emailHeader);
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
    @Operation(summary = "Update resource status", description = "Toggles resource status (Admin only)")
    @ApiResponse(responseCode = "200", description = "Status updated successfully")
    public ResponseEntity<ResourceResponseDTO> updateStatus(
            @PathVariable @NonNull Long id,
            @RequestParam ResourceStatus status,
            HttpSession session,
            @RequestHeader(value = "X-User-Email", required = false) String emailHeader
    ) {
        requireAdmin(session, emailHeader);
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }
}
