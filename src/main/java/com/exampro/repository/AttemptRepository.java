package com.exampro.repository; import com.exampro.entity.*; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface AttemptRepository extends JpaRepository<Attempt,Long>{ List<Attempt> findByUserIdOrderByStartedAtDesc(Long userId); boolean existsByUserIdAndExamIdAndStatus(Long userId,Long examId,Attempt.Status status); }
