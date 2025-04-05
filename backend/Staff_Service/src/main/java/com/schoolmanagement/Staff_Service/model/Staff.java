package com.schoolmanagement.Staff_Service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolmanagement.Staff_Service.dto.TeacherResponseDTO;
import com.schoolmanagement.Staff_Service.enums.EmploymentStatus;
import com.schoolmanagement.Staff_Service.enums.Gender;
import com.schoolmanagement.Staff_Service.enums.Role;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(exclude = { "teacher", "attendances", "addressJsonString" })
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_seq")
    @SequenceGenerator(name = "staff_seq", sequenceName = "staff_sequence", allocationSize = 1)
    private Long staffId;

    @NotNull(message = "User ID cannot be null")
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    private String schoolId;

    @NotBlank(message = "First name is required.")
    private String firstName;

    private String middleName;

    @NotBlank(message = "Last name is required.")
    private String lastName;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 5, max = 30, message = "Username must be between 5 and 30 characters")
    @Column(unique = true)
    private String username;

    private LocalDate dateOfJoining;

    @Email(message = "Email should be valid.")
    @NotBlank(message = "Email is required.")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    private Set<String> roles;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits and may optionally start with a '+'")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private EmploymentStatus status;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Transient
    @JsonProperty("addressJson")
    private Map<String, Object> addressJson;

    @Column(columnDefinition = "JSON")
    private String addressJsonString;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String created_by;

    private String updated_by;

    @NotNull(message = "Active status cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Lob
    @Column(columnDefinition = "BLOB")
    private String photo; // Store photo as BLOB

    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<StaffAttendance> attendances;

    @OneToOne(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Teacher teacher;

    private static final ObjectMapper mapper = new ObjectMapper();

    @JsonIgnore
    public Map<String, Object> getAddressJson() {
        if (addressJsonString == null || addressJsonString.isEmpty()) {
            return new HashMap<>();
        }
        try {
            return mapper.readValue(addressJsonString, new TypeReference<Map<String, Object>>() {
            });
        } catch (JsonProcessingException e) {
            return new HashMap<>(); // Return empty map instead of throwing an exception
        }
    }

    public void setAddressJson(String addressJsonString) {
        try {
            // First validate that the string is valid JSON
            if (addressJsonString != null && !addressJsonString.isEmpty()) {
                mapper.readValue(addressJsonString, Map.class); // Validate JSON
                this.addressJsonString = addressJsonString;
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid JSON format for address", e);
        }
    }

    public void setAddressJson(Map<String, Object> addressJson) {
        try {
            if (addressJson != null && !addressJson.isEmpty()) {
                this.addressJsonString = mapper.writeValueAsString(addressJson); // Convert Map to JSON string
            } else {
                this.addressJsonString = null;
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize address JSON", e);
        }
    }

}
