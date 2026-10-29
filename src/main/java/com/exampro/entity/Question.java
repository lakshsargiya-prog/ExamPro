package com.exampro.entity;
import jakarta.persistence.*; import lombok.*; import java.util.*;
@Entity @Table(name="questions") @Getter @Setter @NoArgsConstructor
public class Question {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, length=2000) private String text;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private Difficulty difficulty=Difficulty.MEDIUM;
 @Column(nullable=false) private double marks=1.0;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="subject_id") private Subject subject;
 @OneToMany(mappedBy="question", cascade=CascadeType.ALL, orphanRemoval=true) private List<QuestionOption> options=new ArrayList<>();
 public void addOption(QuestionOption option){ options.add(option); option.setQuestion(this); }
 public enum Difficulty { EASY, MEDIUM, HARD }
}
