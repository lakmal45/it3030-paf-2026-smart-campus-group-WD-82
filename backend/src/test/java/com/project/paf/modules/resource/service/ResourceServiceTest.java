package com.project.paf.modules.resource.service;

import com.project.paf.modules.resource.dto.ResourceRequestDTO;
import com.project.paf.modules.resource.dto.ResourceResponseDTO;
import com.project.paf.modules.resource.model.Resource;
import com.project.paf.modules.resource.model.ResourceStatus;
import com.project.paf.modules.resource.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource resource;
    private ResourceRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId(1L);
        resource.setName("Lab 101");
        resource.setType("Lab");
        resource.setLocation("Building A");
        resource.setCapacity(30);
        resource.setAvailable(true);
        resource.setStatus(ResourceStatus.ACTIVE);

        requestDTO = new ResourceRequestDTO();
        requestDTO.setName("Lab 101 Update");
        requestDTO.setType("Lab");
        requestDTO.setLocation("Building A");
        requestDTO.setCapacity(35);
        requestDTO.setAvailable(true);
        requestDTO.setStatus(ResourceStatus.ACTIVE);
    }

    @Test
    void getAllResources_shouldReturnList() {
        when(resourceRepository.findAll()).thenReturn(List.of(resource));

        List<ResourceResponseDTO> result = resourceService.getAllResources();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Lab 101");
        verify(resourceRepository, times(1)).findAll();
    }

    @Test
    void createResource_shouldSaveAndReturnDTO() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        ResourceResponseDTO result = resourceService.createResource(requestDTO);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Lab 101");
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    void updateResource_shouldUpdateAndReturnDTO() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        ResourceResponseDTO result = resourceService.updateResource(1L, requestDTO);

        assertThat(result).isNotNull();
        verify(resourceRepository, times(1)).findById(1L);
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }
}
