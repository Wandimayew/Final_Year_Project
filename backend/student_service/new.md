import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class ParentGuardian {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long parentId;
    private Long schoolId;
    private String firstName;
    private String lastName;
    private String relation;
    private String email;
    private String address;
    private String phoneNumber;
    private Boolean isPrimary;
    private LocalDate startDate;
    private LocalDate endDate;

    @OneToMany(mappedBy = "parentGuardian", cascade = CascadeType.ALL)
    private List<Student> students;

    // Getters and setters
}

@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String studentId;
    private Long schoolId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String nationalId;
    private LocalDate dob;
    private String gender;
    private String contactInfo;
    private String photo;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private ParentGuardian parentGuardian;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Attendance> attendanceRecords;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
    private Enrollment enrollment;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Promotion> promotions;

    // Getters and setters
}

@Entity
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;
    private Long schoolId;
    private Long classId;
    private LocalDate attendanceDate;
    private String recordedBy;
    private String remarks;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    // Getters and setters
}

@Entity
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long schoolId;
    private Long classId;
    private String academicYear;
    private LocalDate enrollmentDate;
    private Boolean isTransferred;
    private String transferReason;

    @OneToOne
    @JoinColumn(name = "student_id")
    private Student student;

    // Getters and setters
}

@Entity
public class ParentCommunication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long schoolId;
    private LocalDateTime sentAt;
    private String message;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private ParentGuardian parentGuardian;

    // Getters and setters
}

@Entity
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long schoolId;
    private Long previousClassId;
    private Long newClassId;
    private LocalDate promotionDate;
    private String remark;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    // Getters and setters
}

@Entity
public class QRCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long qrCodeId;
    private Long schoolId;
    private Long classId;
    private LocalDateTime generatedTime;
    private LocalDateTime expiryTime;
    private String sessionToken;
    private String generatedBy;

    @Enumerated(EnumType.STRING)
    private QRCodeStatus status;

    public enum QRCodeStatus {
        ACTIVE, EXPIRED, INVALID
    }

    // Getters and setters
}
