package com.project.paf.modules.resource.service;

import com.project.paf.modules.resource.dto.ResourceRequestDTO;
import com.project.paf.modules.resource.dto.ResourceResponseDTO;
import com.project.paf.modules.resource.exception.ResourceNotFoundException;
import com.project.paf.modules.resource.model.Resource;
import com.project.paf.modules.resource.model.ResourceStatus;
import com.project.paf.modules.resource.repository.ResourceRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<ResourceResponseDTO> getFilteredResources(
            String name,
            String type,
            String location,
            Integer minCapacity,
            Boolean available
    ) {
        // Updated service to use repository filtering
        return resourceRepository.findByFilters(name, type, location, minCapacity, available)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return toResponseDTO(resource);
    }

    public ResourceResponseDTO createResource(@Valid ResourceRequestDTO requestDTO) {
        Resource resource = toEntity(requestDTO);
        Resource savedResource = resourceRepository.save(resource);
        return toResponseDTO(savedResource);
    }

    public ResourceResponseDTO updateResource(Long id, @Valid ResourceRequestDTO requestDTO) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        existingResource.setName(requestDTO.getName());
        existingResource.setType(requestDTO.getType());
        existingResource.setLocation(requestDTO.getLocation());
        existingResource.setCapacity(requestDTO.getCapacity());
        existingResource.setAvailable(requestDTO.getAvailable());
        existingResource.setStatus(requestDTO.getStatus());
        existingResource.setDescription(requestDTO.getDescription());

        Resource updatedResource = resourceRepository.save(existingResource);
        return toResponseDTO(updatedResource);
    }

    public ResourceResponseDTO updateResourceStatus(Long id, ResourceStatus status) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        
        existingResource.setStatus(status);
        // If status is BOOKED or IN_MAINTENANCE, we might want to mark available=false, 
        // but for now, we'll keep it simple as a status toggle.
        if (status == ResourceStatus.ACTIVE) {
            existingResource.setAvailable(true);
        } else if (status == ResourceStatus.RETIRED) {
            existingResource.setAvailable(false);
        }

        Resource updatedResource = resourceRepository.save(existingResource);
        return toResponseDTO(updatedResource);
    }

    public void deleteResource(Long id) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resourceRepository.delete(existingResource);
    }

    private Resource toEntity(ResourceRequestDTO requestDTO) {
        Resource resource = new Resource();
        resource.setName(requestDTO.getName());
        resource.setType(requestDTO.getType());
        resource.setLocation(requestDTO.getLocation());
        resource.setCapacity(requestDTO.getCapacity());
        resource.setAvailable(requestDTO.getAvailable());
        resource.setStatus(requestDTO.getStatus());
        resource.setDescription(requestDTO.getDescription());
        return resource;
    }

    private ResourceResponseDTO toResponseDTO(Resource resource) {
        ResourceResponseDTO responseDTO = new ResourceResponseDTO();
        responseDTO.setId(resource.getId());
        responseDTO.setName(resource.getName());
        responseDTO.setType(resource.getType());
        responseDTO.setLocation(resource.getLocation());
        responseDTO.setCapacity(resource.getCapacity());
        responseDTO.setAvailable(resource.getAvailable());
        responseDTO.setStatus(resource.getStatus());
        responseDTO.setDescription(resource.getDescription());
        return responseDTO;
    }
}
