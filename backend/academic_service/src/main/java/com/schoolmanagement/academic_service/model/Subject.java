package com.schoolmanagement.academic_service.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "subject")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long subjectId;

    @Column(nullable = false)
    @NotBlank(message = "School Id must not be null or Empty")
    private String schoolId;

    @Column(nullable = false)
    @NotBlank(message = "Subject Name must not be null or Empty")
    private String subjectName;

    @Column(nullable = false)
    @NotNull(message = "Credit Hour must not be null")
    @Min(value = 1, message = "Credit Hour must be at least 1")
    private Integer creditHours;

    @Column(nullable = false)
    @NotBlank(message = "Subject Code must not be null or Empty")
    private String subjectCode;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.REMOVE)
    @JoinTable(name = "class_subject", joinColumns = @JoinColumn(name = "subjectId"), inverseJoinColumns = @JoinColumn(name = "classId"))
    private Set<Class> classList;

    @ManyToMany(mappedBy = "subjects")
    private List<TimeTable> timeTableId = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Column(nullable = true)
    private LocalDateTime updated_at;

    @Column(nullable = true)
    private String updated_by;

    @Column(nullable = false)
    private String created_by;

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

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Subject subject = (Subject) o;
        return Objects.equals(subjectId, subject.subjectId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(subjectId);
    }
}