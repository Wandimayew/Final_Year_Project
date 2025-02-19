package com.schoolmanagement.academic_service.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import javax.validation.constraints.NotBlank;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "class")
@Data
public class Class {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long classId;

    @Column(nullable = false)
    @NotBlank(message = "School Id must not be null or empty")
    private String schoolId;

    @Column(nullable = false)
    @NotBlank(message = "Class Name must not be null or Empty")
    private String className;

    @Column(nullable = false)
    @NotBlank(message = "Academic Year of class must not be null or Empty")
    String academicYear;

    // @ManyToMany(fetch = FetchType.EAGER)
    // @JoinTable(name = "class_subject", joinColumns = @JoinColumn(name =
    // "classId"), inverseJoinColumns = @JoinColumn(name = "subjectId"))

    @ManyToMany(mappedBy = "classList", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    private Set<Subject> subjectList;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "class_section", joinColumns = @JoinColumn(name = "classId"), inverseJoinColumns = @JoinColumn(name = "streamId"))
    private Set<Stream> stream = new HashSet<>();

    @OneToMany(mappedBy = "classId", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Section> sections = new HashSet<>();

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
        return created_at.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public String getFormattedUpdatedOn() {
        return updated_at.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Class aClass = (Class) o;
        return Objects.equals(classId, aClass.classId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(classId);
    }

}
