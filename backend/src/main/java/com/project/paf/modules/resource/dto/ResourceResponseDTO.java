package com.project.paf.modules.resource.dto;

import com.project.paf.modules.resource.model.ResourceStatus;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ResourceResponseDTO {

    private Long id;
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private Boolean available;
    private ResourceStatus status;
    private String description;
}
