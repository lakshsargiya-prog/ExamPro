-- ====================================================================
-- ExamPro Synthetic College Demo Dataset (Zero Cost Demo)
-- Safe for public college demonstrations and evaluation.
-- Contains no personal data, no plaintext passwords, and no backdoor accounts.
-- ====================================================================

USE exampro;

-- --------------------------------------------------------------------
-- 1. Academic Subjects
-- --------------------------------------------------------------------
INSERT INTO subjects (id, name, description) VALUES
(1, 'Computer Science & Java Programming', 'Core object-oriented design, JVM internals, multithreading, and standard libraries.')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

INSERT INTO subjects (id, name, description) VALUES
(2, 'Web & Cloud Architecture', 'HTTP/HTTPS protocols, RESTful APIs, modern frontend frameworks, and cloud deployment.')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

INSERT INTO subjects (id, name, description) VALUES
(3, 'Database Management Systems', 'Relational data modeling, SQL queries, indexing, transactions, and ACID principles.')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- --------------------------------------------------------------------
-- 2. Questions & Multiple-Choice Options
-- --------------------------------------------------------------------

-- Question 1 (Java - Subject 1)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(1, 'Which interface in the Java Collections Framework must be implemented to define custom ordering for objects via Collections.sort()?', 'MEDIUM', 5.0, 1)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(1, 'java.util.Comparator', 1, 1),
(2, 'java.lang.Comparable', 0, 1),
(3, 'java.lang.Cloneable', 0, 1),
(4, 'java.io.Serializable', 0, 1)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 2 (Java - Subject 1)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(2, 'What is the precise bit-width of a primitive int data type in Java across all operating system architectures?', 'EASY', 5.0, 1)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(5, '32 bits (4 bytes)', 1, 2),
(6, '16 bits (2 bytes)', 0, 2),
(7, '64 bits (8 bytes)', 0, 2),
(8, 'Platform-dependent (either 32 or 64 bits)', 0, 2)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 3 (Java - Subject 1)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(3, 'Which of the following describes the behavior of the final keyword when applied to a class declaration in Java?', 'MEDIUM', 5.0, 1)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(9, 'The class cannot be extended through inheritance', 1, 3),
(10, 'All fields of the class are automatically made immutable', 0, 3),
(11, 'Instances of the class cannot be serialized', 0, 3),
(12, 'The class can only contain static methods', 0, 3)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 4 (Java - Subject 1)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(4, 'What is the primary operational role of the Java Virtual Machine (JVM) during bytecode execution?', 'EASY', 5.0, 1)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(13, 'Converts intermediate bytecode into target CPU machine instructions at runtime', 1, 4),
(14, 'Directly compiles .java source files into assembly files', 0, 4),
(15, 'Links C++ dynamic library binaries into bytecode', 0, 4),
(16, 'Manages physical GPU hardware registers', 0, 4)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 5 (Web - Subject 2)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(5, 'According to the RFC 7231 HTTP/1.1 specification, which HTTP method is defined as idempotent and replaces the entire target resource state?', 'MEDIUM', 5.0, 2)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(17, 'PUT', 1, 5),
(18, 'POST', 0, 5),
(19, 'PATCH', 0, 5),
(20, 'CONNECT', 0, 5)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 6 (Web - Subject 2)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(6, 'In modern Single-Page Applications (SPAs), what HTTP response status code indicates an unauthenticated request requiring valid credentials?', 'EASY', 5.0, 2)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(21, '401 Unauthorized', 1, 6),
(22, '403 Forbidden', 0, 6),
(23, '404 Not Found', 0, 6),
(24, '400 Bad Request', 0, 6)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 7 (Web - Subject 2)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(7, 'Which React hook is standard for synchronizing state with external side effects such as data fetching or subscriptions?', 'EASY', 5.0, 2)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(25, 'useEffect', 1, 7),
(26, 'useState', 0, 7),
(27, 'useMemo', 0, 7),
(28, 'useContext', 0, 7)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 8 (Web - Subject 2)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(8, 'In the context of JSON Web Tokens (JWT), what ensures that the token claims have not been tampered with in transit?', 'HARD', 5.0, 2)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(29, 'The cryptographic signature computed using the header, payload, and server secret', 1, 8),
(30, 'Base64Url encoding of the payload section', 0, 8),
(31, 'The HTTPS TLS handshake between client and reverse proxy', 0, 8),
(32, 'The standard expiration claim (exp) embedded in the payload', 0, 8)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 9 (Database - Subject 3)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(9, 'In relational database theory, which ACID property guarantees that all operations within a transaction either completely commit or are completely rolled back?', 'EASY', 5.0, 3)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(33, 'Atomicity', 1, 9),
(34, 'Consistency', 0, 9),
(35, 'Isolation', 0, 9),
(36, 'Durability', 0, 9)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 10 (Database - Subject 3)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(10, 'Which SQL clause is used to filter aggregated group records produced by a GROUP BY statement?', 'MEDIUM', 5.0, 3)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(37, 'HAVING', 1, 10),
(38, 'WHERE', 0, 10),
(39, 'ORDER BY', 0, 10),
(40, 'LIMIT', 0, 10)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- Question 11 (Database - Subject 3)
INSERT INTO questions (id, text, difficulty, marks, subject_id) VALUES
(11, 'What index data structure is most widely used by relational database engines (e.g. MySQL InnoDB) for efficient range queries and point lookups?', 'MEDIUM', 5.0, 3)
ON DUPLICATE KEY UPDATE text=VALUES(text), marks=VALUES(marks);

INSERT INTO question_options (id, text, correct, question_id) VALUES
(41, 'B+ Tree', 1, 11),
(42, 'Binary Search Tree', 0, 11),
(43, 'Hash Table', 0, 11),
(44, 'Red-Black Tree', 0, 11)
ON DUPLICATE KEY UPDATE text=VALUES(text), correct=VALUES(correct);

-- --------------------------------------------------------------------
-- 3. Scheduled College Examinations
-- --------------------------------------------------------------------

-- Exam 1: Java & Object-Oriented Design (Questions 1, 2, 3, 4 -> 20 marks)
INSERT INTO exams (id, title, description, duration_minutes, passing_percentage, available_from, available_until) VALUES
(1, 'Java & Object-Oriented Design Certification', 'College-level assessment covering Java syntax, collections framework, and JVM execution principles.', 30, 60.0, '2026-01-01 00:00:00', '2027-12-31 23:59:59')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), duration_minutes=VALUES(duration_minutes), passing_percentage=VALUES(passing_percentage);

-- Exam 2: Full Stack Web & API Engineering (Questions 5, 6, 7, 8 -> 20 marks)
INSERT INTO exams (id, title, description, duration_minutes, passing_percentage, available_from, available_until) VALUES
(2, 'Full Stack Web & API Engineering Exam', 'Evaluation of HTTP protocols, REST architectural constraints, React component architecture, and JWT security.', 25, 50.0, '2026-01-01 00:00:00', '2027-12-31 23:59:59')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), duration_minutes=VALUES(duration_minutes), passing_percentage=VALUES(passing_percentage);

-- Exam 3: Database Systems & Relational Modeling (Questions 9, 10, 11 -> 15 marks)
INSERT INTO exams (id, title, description, duration_minutes, passing_percentage, available_from, available_until) VALUES
(3, 'Database Systems & SQL Essentials', 'Assessment on relational database design, indexing structures, SQL aggregations, and ACID transaction guarantees.', 20, 60.0, '2026-01-01 00:00:00', '2027-12-31 23:59:59')
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), duration_minutes=VALUES(duration_minutes), passing_percentage=VALUES(passing_percentage);

-- --------------------------------------------------------------------
-- 4. Assign Questions to Exams (Join Table)
-- --------------------------------------------------------------------
-- Exam 1 -> Questions 1, 2, 3, 4
INSERT IGNORE INTO exam_questions (exam_id, question_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4);

-- Exam 2 -> Questions 5, 6, 7, 8
INSERT IGNORE INTO exam_questions (exam_id, question_id) VALUES
(2, 5), (2, 6), (2, 7), (2, 8);

-- Exam 3 -> Questions 9, 10, 11
INSERT IGNORE INTO exam_questions (exam_id, question_id) VALUES
(3, 9), (3, 10), (3, 11);

