package com.project.paf.modules.resource.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.paf.modules.resource.dto.ResourceRequestDTO;
import com.project.paf.modules.resource.dto.ResourceResponseDTO;
import com.project.paf.modules.resource.model.ResourceStatus;
import com.project.paf.modules.resource.service.ResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ResourceController.class)
@AutoConfigureMockMvc(addFilters = false)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResourceService resourceService;

    @Autowired
    private ObjectMapper objectMapper;

    private ResourceResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        responseDTO = new ResourceResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setName("Lab 101");
        responseDTO.setType("Lab");
        responseDTO.setLocation("Building A");
        responseDTO.setCapacity(30);
        responseDTO.setAvailable(true);
        responseDTO.setStatus(ResourceStatus.ACTIVE);
    }

    @Test
    void getAllResources_shouldReturn200() throws Exception {
        when(resourceService.getAllResources()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Lab 101"));
    }

    @Test
    void createResource_withValidData_shouldReturn201() throws Exception {
        ResourceRequestDTO requestDTO = new ResourceRequestDTO();
        requestDTO.setName("Lab 101");
        requestDTO.setType("Lab");
        requestDTO.setLocation("Building A");
        requestDTO.setCapacity(30);
        requestDTO.setAvailable(true);
        requestDTO.setStatus(ResourceStatus.ACTIVE);

        when(resourceService.createResource(any(ResourceRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Lab 101"));
    }

    @Test
    void createResource_withInvalidData_shouldReturn400() throws Exception {
        ResourceRequestDTO invalidDTO = new ResourceRequestDTO();
        // Missing required fields like name, type, etc.

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }
}
