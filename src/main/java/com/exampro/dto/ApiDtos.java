package com.exampro.dto;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.time.LocalDateTime; import java.util.*;
public final class ApiDtos { private ApiDtos(){}
 public record RegisterRequest(@NotBlank @Size(max=120) String fullName,@Email @NotBlank String email,@Size(min=8,max=100) String password){}
 public record LoginRequest(@Email @NotBlank String email,@NotBlank String password){}
 public record AuthResponse(String token,String tokenType,Long userId,String fullName,String email,String role){}
 public record SubjectRequest(@NotBlank @Size(max=100) String name,@Size(max=1000) String description){}
 public record SubjectResponse(Long id,String name,String description){}
 public record OptionRequest(@NotBlank @Size(max=1000) String text,boolean correct){}
 public record QuestionRequest(@NotBlank @Size(max=2000) String text,@NotNull Long subjectId,@NotNull com.exampro.entity.Question.Difficulty difficulty,@Positive double marks,@NotEmpty @Size(min=2,max=6) List<@NotNull OptionRequest> options){}
 public record OptionResponse(Long id,String text){}
 public record QuestionResponse(Long id,String text,String difficulty,double marks,Long subjectId,String subjectName,List<OptionResponse> options){}
 public record AdminOptionResponse(Long id,String text,boolean correct){}
 public record AdminQuestionResponse(Long id,String text,String difficulty,double marks,Long subjectId,String subjectName,List<AdminOptionResponse> options){}
 public record ExamRequest(@NotBlank @Size(max=180) String title,@Size(max=2000) String description,@Min(1) @Max(600) int durationMinutes,@DecimalMin("0") @DecimalMax("100") double passingPercentage,LocalDateTime availableFrom,LocalDateTime availableUntil){}
 public record ExamResponse(Long id,String title,String description,int durationMinutes,double passingPercentage,double maximumMarks,LocalDateTime availableFrom,LocalDateTime availableUntil,List<Long> questionIds,boolean availableNow){}
 public record AssignQuestionsRequest(@NotEmpty List<@NotNull Long> questionIds){}
 public record AnswerRequest(@NotNull Long questionId,Long optionId){}
 public record SaveAnswersRequest(@NotEmpty List<@Valid AnswerRequest> answers){}
 public record AttemptResponse(Long attemptId,Long examId,String examTitle,String status,LocalDateTime startedAt,LocalDateTime submittedAt,LocalDateTime deadline,double score,double percentage,boolean passed){}
 public record ResultResponse(Long attemptId,Long examId,String examTitle,String studentEmail,String status,double score,double maximumMarks,double percentage,boolean passed,LocalDateTime submittedAt){}
 public record MessageResponse(String message){}
}

