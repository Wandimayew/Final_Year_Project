package com.schoolmanagement.student_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

import org.hibernate.annotations.Type;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonType;

@Entity
@Data
public class ParentGuardian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long parentId;

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @Size(max = 100, message = "Father name cannot exceed 100 characters")
    private String fatherName;

    @Size(max = 100, message = "Mother name cannot exceed 100 characters")
    private String motherName;

    @Size(max = 100, message = "Mother name cannot exceed 100 characters")
    private String otherFamilyMemberName;

    @NotBlank(message = "Relation cannot be blank")
    @Size(max = 50, message = "Relation cannot exceed 50 characters")
    private String relation;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    @NotNull(message = "Address cannot be null")
    private JsonNode address;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number must be a valid number with 10-15 digits")
    private String phoneNumber;

    @OneToMany(mappedBy = "parentGuardian")
    private List<Student> students;

    @OneToMany(mappedBy = "parentGuardian", cascade = CascadeType.ALL)
    private List<ParentCommunication> parentCommunications;
}