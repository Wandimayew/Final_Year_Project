package com.schoolmanagement.academic_service.model;

import javax.validation.constraints.NotBlank;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "timetable_entries")
public class TimeTableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long entryId;

    @ManyToOne
    @JoinColumn(name = "timetable_id", nullable = false)
    private TimeTable timeTable;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    @NotBlank(message = "Teacher name must not be null or empty")
    private String teacher;

    @Column(nullable = false)
    @NotBlank(message = "Day must not be null or empty")
    private String dayOfWeek;

    @Column(nullable = false)
    @NotBlank(message = "Start Time must not be null or empty")
    private String startTime;

    @Column(nullable = false)
    @NotBlank(message = "End Time must not be null or empty")
    private String endTime;
}
