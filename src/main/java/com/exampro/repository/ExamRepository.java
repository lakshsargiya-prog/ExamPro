package com.exampro.repository; import com.exampro.entity.Exam; import org.springframework.data.jpa.repository.JpaRepository;
public interface ExamRepository extends JpaRepository<Exam,Long>{ }
