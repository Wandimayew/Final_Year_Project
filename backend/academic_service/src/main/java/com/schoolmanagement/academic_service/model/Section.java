package com.schoolmanagement.academic_service.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "section")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long sectionId;

    @Column(nullable = false)
    @NotBlank(message = "School Id must not be null or Empty")
    private String schoolId;

    @Column(nullable = false)
    @NotBlank(message = "Section Name must not be null or Empty")
    private String sectionName;

    @Column(nullable = false)
    @NotNull(message = "Capacity must not be null")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @OneToOne(mappedBy = "section", cascade = CascadeType.ALL)
    private TimeTable timeTable;

    @ManyToOne
    @JoinColumn(name = "classId", nullable = false)
    private Class classId;

     @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Column(nullable = true)
    private LocalDateTime updated_at;

    @Column(nullable = false)
    private String created_by;
    @Column(nullable = true)
    private String updated_by;

    @Column(nullable = false)
    private boolean isActive;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        updated_at = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

    public String getFormattedCreatedOn() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return created_at.format(formatter);
    }
    public String getFormattedUpdatedOn() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return updated_at.format(formatter);
    }
}
