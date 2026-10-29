package com.exampro.exception;
import java.time.Instant; import java.util.*; import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(NotFoundException.class) ResponseEntity<Map<String,Object>> notFound(NotFoundException e){return response(HttpStatus.NOT_FOUND,e.getMessage());}
 @ExceptionHandler({BadRequestException.class,IllegalArgumentException.class}) ResponseEntity<Map<String,Object>> badRequest(RuntimeException e){return response(HttpStatus.BAD_REQUEST,e.getMessage());}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException e){String msg=e.getBindingResult().getFieldErrors().stream().map(x->x.getField()+": "+x.getDefaultMessage()).findFirst().orElse("Invalid request");return response(HttpStatus.BAD_REQUEST,msg);}
 @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class) ResponseEntity<Map<String,Object>> conflict(Exception e){return response(HttpStatus.CONFLICT,"The operation conflicts with existing data.");}
 private ResponseEntity<Map<String,Object>> response(HttpStatus s,String m){return ResponseEntity.status(s).body(Map.of("timestamp",Instant.now().toString(),"status",s.value(),"error",s.getReasonPhrase(),"message",m));}
}
