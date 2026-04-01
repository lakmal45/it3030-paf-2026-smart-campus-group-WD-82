package com.project.paf.dto;

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
    private String status;
    private String description;
}
