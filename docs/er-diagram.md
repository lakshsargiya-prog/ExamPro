# ExamPro ER Diagram
```mermaid
erDiagram
 USERS ||--o{ ATTEMPTS : starts
 EXAMS ||--o{ ATTEMPTS : receives
 SUBJECTS ||--o{ QUESTIONS : contains
 QUESTIONS ||--o{ QUESTION_OPTIONS : offers
 EXAMS ||--o{ EXAM_QUESTIONS : includes
 QUESTIONS ||--o{ EXAM_QUESTIONS : assigned
 ATTEMPTS ||--o{ STUDENT_ANSWERS : records
 QUESTIONS ||--o{ STUDENT_ANSWERS : answered
 QUESTION_OPTIONS ||--o{ STUDENT_ANSWERS : selected
 USERS { bigint id PK string full_name string email string password_hash string role }
 SUBJECTS { bigint id PK string name string description }
 QUESTIONS { bigint id PK bigint subject_id FK string text double marks string difficulty }
 QUESTION_OPTIONS { bigint id PK bigint question_id FK string text boolean correct }
 EXAMS { bigint id PK string title int duration_minutes double passing_percentage }
 EXAM_QUESTIONS { bigint exam_id FK bigint question_id FK }
 ATTEMPTS { bigint id PK bigint user_id FK bigint exam_id FK string status double score double percentage }
 STUDENT_ANSWERS { bigint id PK bigint attempt_id FK bigint question_id FK bigint selected_option_id FK double awarded_marks }
```
Relationships are normalized to separate subjects, questions, options, exams, attempts, and answers. Historical attempts should be retained; avoid deleting exams/questions after they have attempts.
