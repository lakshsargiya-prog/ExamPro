package com.exampro.repository; import com.exampro.entity.Subject; import org.springframework.data.jpa.repository.JpaRepository;
public interface SubjectRepository extends JpaRepository<Subject,Long>{ boolean existsByNameIgnoreCase(String name); }
