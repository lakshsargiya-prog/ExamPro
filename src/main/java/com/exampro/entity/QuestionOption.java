package com.exampro.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Table(name="question_options") @Getter @Setter @NoArgsConstructor
public class QuestionOption {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, length=1000) private String text;
 @Column(nullable=false) private boolean correct;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="question_id") private Question question;
}
