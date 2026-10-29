package com.exampro.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*; import java.util.*;
@Entity @Table(name="exams") @Getter @Setter @NoArgsConstructor
public class Exam {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=180) private String title;
 @Column(length=2000) private String description;
 @Column(nullable=false) private int durationMinutes;
 @Column(nullable=false) private double passingPercentage=40.0;
 private LocalDateTime availableFrom; private LocalDateTime availableUntil;
 @ManyToMany @JoinTable(name="exam_questions", joinColumns=@JoinColumn(name="exam_id"), inverseJoinColumns=@JoinColumn(name="question_id")) private Set<Question> questions=new LinkedHashSet<>();
 public double getMaximumMarks(){return questions.stream().mapToDouble(Question::getMarks).sum();}
 public boolean isAvailableNow(){LocalDateTime now=LocalDateTime.now();return (availableFrom==null||!now.isBefore(availableFrom))&&(availableUntil==null||!now.isAfter(availableUntil));}
}
