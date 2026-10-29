USE exampro;
-- Inspect users without password hashes
SELECT id, full_name, email, role, created_at FROM users;
-- Questions grouped by subject
SELECT s.name AS subject, COUNT(q.id) AS question_count
FROM subjects s LEFT JOIN questions q ON q.subject_id=s.id GROUP BY s.id,s.name ORDER BY s.name;
-- Exam question count and maximum marks
SELECT e.id,e.title,COUNT(eq.question_id) AS question_count,COALESCE(SUM(q.marks),0) AS maximum_marks
FROM exams e LEFT JOIN exam_questions eq ON eq.exam_id=e.id LEFT JOIN questions q ON q.id=eq.question_id GROUP BY e.id,e.title;
-- Results report (join + aggregation)
SELECT e.title,u.email,COUNT(a.id) attempts,MAX(a.percentage) best_percentage,AVG(a.percentage) average_percentage
FROM attempts a JOIN users u ON u.id=a.user_id JOIN exams e ON e.id=a.exam_id
WHERE a.status IN ('SUBMITTED','EXPIRED') GROUP BY e.id,e.title,u.id,u.email ORDER BY e.title, best_percentage DESC;
-- Subquery: students with at least one passing result
SELECT DISTINCT u.id,u.full_name,u.email FROM users u WHERE u.role='STUDENT' AND EXISTS
(SELECT 1 FROM attempts a WHERE a.user_id=u.id AND a.passed=TRUE);
-- Create a reporting view
CREATE OR REPLACE VIEW v_exam_result_summary AS
SELECT a.id AS attempt_id,e.title AS exam_title,u.email AS student_email,a.score,a.percentage,a.passed,a.status,a.submitted_at
FROM attempts a JOIN exams e ON e.id=a.exam_id JOIN users u ON u.id=a.user_id;
-- Example transaction / rollback practice (run only against disposable data)
START TRANSACTION;
UPDATE subjects SET description=CONCAT(COALESCE(description,''),' [practice]') WHERE id=-1;
ROLLBACK;
-- Index recommendations (already covered partly by JPA annotations)
CREATE INDEX idx_attempts_status ON attempts(status);
CREATE INDEX idx_questions_subject ON questions(subject_id);
