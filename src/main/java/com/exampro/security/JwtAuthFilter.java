package com.exampro.security;
import com.exampro.repository.UserRepository; import jakarta.servlet.*; import jakarta.servlet.http.*; import java.io.IOException; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
@Component public class JwtAuthFilter extends OncePerRequestFilter {
 private final JwtService jwt; private final UserRepository users;
 public JwtAuthFilter(JwtService jwt,UserRepository users){this.jwt=jwt;this.users=users;}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  String h=request.getHeader("Authorization"); if(h!=null&&h.startsWith("Bearer ")&&SecurityContextHolder.getContext().getAuthentication()==null){String token=h.substring(7);if(jwt.isValid(token)){String email=jwt.extractEmail(token);users.findByEmailIgnoreCase(email).ifPresent(u->{var auth=new UsernamePasswordAuthenticationToken(u.getEmail(),null,java.util.List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name())));SecurityContextHolder.getContext().setAuthentication(auth);});}}
  chain.doFilter(request,response);
 }
}
