package com.schoolmanagement.student_service.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
public class ParentCommunication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @NotNull(message = "Sent date and time cannot be null")
    @PastOrPresent(message = "Sent date and time must be in the past or present")
    private LocalDateTime sentAt;

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String message;

    @ManyToOne
    @JoinColumn(name = "parentId")
    @NotNull(message = "Parent/Guardian cannot be null")
    private ParentGuardian parentGuardian;
}