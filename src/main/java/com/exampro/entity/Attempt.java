package com.exampro.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.util.*;
@Entity @Table(name="attempts", indexes=@Index(name="idx_attempt_user_exam",columnList="user_id,exam_id")) @Getter @Setter @NoArgsConstructor
public class Attempt {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private AppUser user;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="exam_id") private Exam exam;
 @Column(nullable=false) private LocalDateTime startedAt=LocalDateTime.now();
 private LocalDateTime submittedAt;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private Status status=Status.IN_PROGRESS;
 @Column(nullable=false) private double score=0;
 @Column(nullable=false) private double percentage=0;
 @Column(nullable=false) private boolean passed=false;
 @OneToMany(mappedBy="attempt",cascade=CascadeType.ALL,orphanRemoval=true) private List<StudentAnswer> answers=new ArrayList<>();
 public enum Status { IN_PROGRESS, SUBMITTED, EXPIRED }
}
