package com.schoolmanagement.Staff_Service.model;

import com.schoolmanagement.Staff_Service.enums.QRCodeStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Data
@Table(name = "qr_code")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QRCode{
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long qrCodeId;
    
    @OneToOne
    @JoinColumn(name = "attendance_id")
    private StaffAttendance attendance;
    
    private String schoolId;
    
    private LocalDateTime generatedTime;

    private Integer startTimeHour;    
    private Integer startTimeMinute;  
    private Integer endTimeHour;      
    private Integer endTimeMinute;  

    private LocalDateTime expiryTime;
    
    @NotBlank(message = "Session token is required.")
    @Column(name = "session_token", columnDefinition = "TEXT")
    private String sessionToken;
    
    private String generatedBy;
    
    @Enumerated(EnumType.STRING)
    private QRCodeStatus status;

    private String qrCodeUUID;

    @Column(name = "qr_code_image", columnDefinition = "TEXT")
    private String qrCodeImage;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private String createdBy;

    private String updatedBy;
    
    @NotNull(message = "Active status cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
