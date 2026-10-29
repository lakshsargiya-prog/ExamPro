package com.exampro.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Table(name="student_answers", uniqueConstraints=@UniqueConstraint(name="uk_attempt_question",columnNames={"attempt_id","question_id"})) @Getter @Setter @NoArgsConstructor
public class StudentAnswer {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="attempt_id") private Attempt attempt;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="question_id") private Question question;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="selected_option_id") private QuestionOption selectedOption;
 @Column(nullable=false) private double awardedMarks=0;
}
