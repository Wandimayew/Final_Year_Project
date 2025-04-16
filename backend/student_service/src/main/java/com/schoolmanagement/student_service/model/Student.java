// package com.schoolmanagement.student_service.model;

// import java.time.LocalDate;

// import org.hibernate.annotations.Type;

// import jakarta.persistence.*;
// import lombok.Data;
// import com.fasterxml.jackson.databind.JsonNode;
// import com.vladmihalcea.hibernate.type.json.JsonType;

// @Entity
// @Data
// @Table(name = "students")
// public class Student {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     private String studentId;
//     private Long schoolId;
//     private Long classId;
//     private Long sectionId;
//     private String firstName;
//     private String middleName;
//     private String lastName;
//     private String nationalId;
//     private String username;
//     private LocalDate dob;
//     private String gender;
//     private String contactInfo;
//     private String photo;

//     @Type(JsonType.class)
//     @Column(columnDefinition = "json")
//     private JsonNode address;

//     private boolean isActive;
//     private boolean isPassed;
//     private LocalDate admissionDate;
    
//     @ManyToOne
//     @JoinColumn(name = "parentId")
//     private ParentGuardian parentGuardian;
// }


package com.schoolmanagement.student_service.model;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonType;

@Entity
@Data
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @NotBlank(message = "Student ID cannot be blank")
    @Size(max = 50, message = "Student ID cannot exceed 50 characters")
    private String registNo;

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

    @NotNull(message = "Class ID cannot be null")
    private Long classId;

    @NotNull(message = "Section ID cannot be null")
    private Long sectionId;

    @NotBlank(message = "First name cannot be blank")
    @Size(max = 100, message = "First name cannot exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Middle name cannot exceed 100 characters")
    private String middleName;

    @NotBlank(message = "Last name cannot be blank")
    @Size(max = 100, message = "Last name cannot exceed 100 characters")
    private String lastName;

    @NotBlank(message = "National ID cannot be blank")
    @Size(max = 20, message = "National ID cannot exceed 20 characters")
    private String nationalId;

    @NotBlank(message = "Username cannot be blank")
    @Size(max = 50, message = "Username cannot exceed 50 characters")
    private String username;

    @NotNull(message = "Date of birth cannot be null")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender cannot be blank")
    @Pattern(regexp = "Male|Female|Other", message = "Gender must be Male, Female, or Other")
    private String gender;

    @NotBlank(message = "Contact info cannot be blank")
    @Size(max = 255, message = "Contact info cannot exceed 255 characters")
    private String contactInfo;

    @Size(max = 255, message = "Photo URL cannot exceed 255 characters")
    private String photo;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    @NotNull(message = "Address cannot be null")
    private JsonNode address;

    private Status isActive;

    public enum Status {
        ACTIVE,
        INACTIVE
    }

    private PassedOrFail isPassed;

    public enum PassedOrFail {
        PASSED,
        FAILED
    }

    @NotNull(message = "Admission date cannot be null")
    @PastOrPresent(message = "Admission date cannot be in the future")
    private LocalDate admissionDate;

    @ManyToOne
    @JoinColumn(name = "parentId")
    private ParentGuardian parentGuardian;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Attendance> attendanceRecords;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
    private Enrollment enrollment;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Promotion> promotions;

    @Override
    public String toString() {
        return "Student{" +
                "studentId=" + studentId +
                ", registNo='" + registNo + '\'' +
                ", userId=" + userId +
                ", schoolId=" + schoolId +
                ", classId=" + classId +
                ", sectionId=" + sectionId +
                ", firstName='" + firstName + '\'' +
                ", middleName='" + middleName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", nationalId='" + nationalId + '\'' +
                ", username='" + username + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", gender='" + gender + '\'' +
                ", contactInfo='" + contactInfo + '\'' +
                ", photo='" + photo + '\'' +
                ", address=" + address +
                ", isActive=" + isActive +
                ", isPassed=" + isPassed +
                ", admissionDate=" + admissionDate +
                // Exclude parentGuardian, attendanceRecords, enrollment, and promotions to avoid recursion
                '}';
    }
}
