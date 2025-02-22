package com.schoolmanagement.Staff_Service.model;

import com.schoolmanagement.Staff_Service.enums.AttendanceStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Data
@Table(name = "staff_attendance")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffAttendance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;
    
    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false, referencedColumnName = "staffId")
    private Staff staff;
    
    private Long schoolId;

    private String sessionToken;
    
    private LocalDate date;
    
    private String recordedBy;
    
    private Long classId;
    
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    
    private String remark;

    private LocalDateTime inTime;  
    
    private LocalDateTime outTime;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private String createdBy;

    private String updatedBy;
    
    @NotNull(message = "Active status cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @OneToOne(mappedBy = "attendance", cascade = CascadeType.ALL)
    private QRCode qrCode;
}
