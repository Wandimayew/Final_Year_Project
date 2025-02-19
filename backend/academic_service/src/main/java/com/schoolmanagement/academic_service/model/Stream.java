package com.schoolmanagement.academic_service.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import javax.validation.constraints.NotBlank;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.Data;

@Entity
@Data
@Table(name = "stream")
public class Stream {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long streamId;

    @Column(nullable = false)
    @NotBlank(message = "School Id must not be Null or Empty")
    private String schoolId;

    @Column(nullable = false)
    @NotBlank(message = "Stream Name must not be null or Empty")
    private String streamName;

    @Column(nullable = false)
    @NotBlank(message = "Stream Code must not be null or Empty")
    private String streamCode;

    @OneToMany(mappedBy = "stream", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Class> classes;

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
