package com.exampro.service;
import com.exampro.dto.ApiDtos.*; import com.exampro.entity.*; import com.exampro.exception.BadRequestException; import com.exampro.repository.UserRepository; import com.exampro.security.JwtService; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class AuthService {
 private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt;
 public AuthService(UserRepository users,PasswordEncoder encoder,JwtService jwt){this.users=users;this.encoder=encoder;this.jwt=jwt;}
 @Transactional public AuthResponse register(RegisterRequest r){if(users.existsByEmailIgnoreCase(r.email()))throw new BadRequestException("Email is already registered");AppUser u=new AppUser();u.setFullName(r.fullName().trim());u.setEmail(r.email().trim().toLowerCase());u.setPasswordHash(encoder.encode(r.password()));u.setRole(Role.STUDENT);u=users.save(u);return auth(u);}
 public AuthResponse login(LoginRequest r){AppUser u=users.findByEmailIgnoreCase(r.email()).orElseThrow(()->new BadRequestException("Invalid email or password"));if(!encoder.matches(r.password(),u.getPasswordHash()))throw new BadRequestException("Invalid email or password");return auth(u);}
 private AuthResponse auth(AppUser u){return new AuthResponse(jwt.generate(u.getEmail(),u.getRole().name()),"Bearer",u.getId(),u.getFullName(),u.getEmail(),u.getRole().name());}
}
