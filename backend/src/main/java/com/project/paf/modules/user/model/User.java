package com.project.paf.modules.user.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = true)
    private String profileImageUrl;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean emailNotificationsEnabled = true;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean pushNotificationsEnabled = true;

}