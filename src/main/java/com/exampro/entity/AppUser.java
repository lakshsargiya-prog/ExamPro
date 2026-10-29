package com.exampro.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;
@Entity @Table(name="users", indexes=@Index(name="idx_users_email", columnList="email", unique=true)) @Getter @Setter @NoArgsConstructor
public class AppUser {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, length=120) private String fullName;
 @Column(nullable=false, unique=true, length=190) private String email;
 @Column(nullable=false) private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Role role=Role.STUDENT;
 @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
}
