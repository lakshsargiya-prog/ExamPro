package com.exampro;

import com.exampro.config.BootstrapAdmin;
import com.exampro.entity.AppUser;
import com.exampro.entity.Role;
import com.exampro.repository.ExamRepository;
import com.exampro.repository.QuestionRepository;
import com.exampro.repository.SubjectRepository;
import com.exampro.repository.UserRepository;
import com.exampro.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ExamProApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void publicLandingPageIsAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(containsString("ExamPro")))
                .andExpect(content().string(containsString("System Operational")));
    }

    @Test
    void publicStatusJsonIsAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/status"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.application").value("ExamPro"))
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void swaggerUiIsAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void protectedEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/exams"))
                .andExpect(status().isForbidden());
    }

    @Test
    void protectedStudentResultsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/results/my"))
                .andExpect(status().isForbidden());
    }

    @Test
    void openApiIncludesBearerAuthenticationScheme() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes['Bearer Authentication'].type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes['Bearer Authentication'].scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes['Bearer Authentication'].bearerFormat").value("JWT"))
                .andExpect(jsonPath("$.security[0]['Bearer Authentication']").isArray());
    }

    @Test
    void openApiKeepsAuthEndpointsPublic() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/auth/register'].post.security").value(hasSize(0)))
                .andExpect(jsonPath("$.paths['/api/auth/login'].post.security").value(hasSize(0)));
    }

    @Test
    void registrationAlwaysAssignsStudentRoleAndIgnoresAdminRoleInPayload() throws Exception {
        String testEmail = "student_test_" + System.currentTimeMillis() + "@example.com";
        String payload = """
                {
                    "fullName": "Student Register Test",
                    "email": "%s",
                    "password": "Password123!",
                    "role": "ADMIN"
                }
                """.formatted(testEmail);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.email").value(testEmail));

        AppUser saved = userRepository.findByEmailIgnoreCase(testEmail).orElseThrow();
        assertEquals(Role.STUDENT, saved.getRole());
        assertTrue(passwordEncoder.matches("Password123!", saved.getPasswordHash()));
    }

    @Test
    void studentAccountReceives403OnAdminEndpoints() throws Exception {
        String studentEmail = "student_forbidden_" + System.currentTimeMillis() + "@example.com";
        AppUser student = new AppUser();
        student.setFullName("Restricted Student");
        student.setEmail(studentEmail);
        student.setPasswordHash(passwordEncoder.encode("Password123!"));
        student.setRole(Role.STUDENT);
        userRepository.save(student);

        String token = jwtService.generate(studentEmail, "STUDENT");

        String examPayload = """
                {
                    "title": "Unauthorized Exam Title",
                    "description": "Should fail with 403",
                    "durationMinutes": 60,
                    "passingPercentage": 70.0
                }
                """;

        mockMvc.perform(post("/api/admin/exams")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(examPayload))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminAccountCanAccessAdminEndpoints() throws Exception {
        String adminEmail = "admin_allowed_" + System.currentTimeMillis() + "@example.com";
        AppUser admin = new AppUser();
        admin.setFullName("Authorized Admin");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        String token = jwtService.generate(adminEmail, "ADMIN");

        String examPayload = """
                {
                    "title": "Authorized Admin Exam",
                    "description": "Created successfully by admin",
                    "durationMinutes": 60,
                    "passingPercentage": 70.0
                }
                """;

        mockMvc.perform(post("/api/admin/exams")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(examPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Authorized Admin Exam"));
    }

    @Test
    void bootstrapProvisionsAdminWhenAccountDoesNotExist() {
        String newAdminEmail = "new_admin_" + System.currentTimeMillis() + "@example.com";
        boolean created = BootstrapAdmin.provisionAdmin(userRepository, passwordEncoder, newAdminEmail, "AdminPass123!", "New Admin");
        assertTrue(created);

        AppUser admin = userRepository.findByEmailIgnoreCase(newAdminEmail).orElseThrow();
        assertEquals(Role.ADMIN, admin.getRole());
        assertTrue(passwordEncoder.matches("AdminPass123!", admin.getPasswordHash()));
    }

    @Test
    void bootstrapDoesNotOverwriteOrPromoteExistingStudent() {
        String existingEmail = "existing_student_" + System.currentTimeMillis() + "@example.com";
        AppUser student = new AppUser();
        student.setFullName("Existing Student");
        student.setEmail(existingEmail);
        student.setPasswordHash(passwordEncoder.encode("OriginalPass123!"));
        student.setRole(Role.STUDENT);
        userRepository.save(student);

        // Attempting to run bootstrap with existing email
        boolean created = BootstrapAdmin.provisionAdmin(userRepository, passwordEncoder, existingEmail, "NewAdminPass123!", "Should Not Change");
        assertFalse(created);

        // Verify account retains original STUDENT role and original password
        AppUser retrieved = userRepository.findByEmailIgnoreCase(existingEmail).orElseThrow();
        assertEquals(Role.STUDENT, retrieved.getRole());
        assertTrue(passwordEncoder.matches("OriginalPass123!", retrieved.getPasswordHash()));
        assertFalse(passwordEncoder.matches("NewAdminPass123!", retrieved.getPasswordHash()));
    }

    @Test
    void bootstrapRejectsPasswordShorterThanEightCharacters() {
        String shortPassEmail = "short_pass_" + System.currentTimeMillis() + "@example.com";
        boolean created = BootstrapAdmin.provisionAdmin(userRepository, passwordEncoder, shortPassEmail, "short", "Short Pass Admin");
        assertFalse(created);
        assertFalse(userRepository.existsByEmailIgnoreCase(shortPassEmail));
    }

    @Test
    void adminCanCreateAssignAndUnassignQuestionsToExam() throws Exception {
        // Setup Subject
        com.exampro.entity.Subject subject = new com.exampro.entity.Subject();
        subject.setName("Testing Subject " + System.currentTimeMillis());
        subject.setDescription("Subject for Question Workflow");
        subject = subjectRepository.save(subject);

        // Setup Exam
        com.exampro.entity.Exam exam = new com.exampro.entity.Exam();
        exam.setTitle("Question Workflow Exam " + System.currentTimeMillis());
        exam.setDescription("Testing Question Management");
        exam.setDurationMinutes(45);
        exam.setPassingPercentage(60.0);
        exam = examRepository.save(exam);

        // Admin User & Token
        String adminEmail = "admin_q_" + System.currentTimeMillis() + "@example.com";
        AppUser admin = new AppUser();
        admin.setFullName("Admin Questions Test");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        String adminToken = jwtService.generate(adminEmail, "ADMIN");

        // Student User & Token
        String studentEmail = "student_q_" + System.currentTimeMillis() + "@example.com";
        AppUser student = new AppUser();
        student.setFullName("Student Questions Test");
        student.setEmail(studentEmail);
        student.setPasswordHash(passwordEncoder.encode("StudentPass123!"));
        student.setRole(Role.STUDENT);
        userRepository.save(student);
        String studentToken = jwtService.generate(studentEmail, "STUDENT");

        // 1. Admin creates a multiple-choice question
        String questionPayload = """
                {
                    "text": "What is the primary role of the JVM?",
                    "subjectId": %d,
                    "difficulty": "MEDIUM",
                    "marks": 5.0,
                    "options": [
                        { "text": "Execute Java bytecode", "correct": true },
                        { "text": "Compile Java source code to machine code directly", "correct": false },
                        { "text": "Provide hardware virtualization", "correct": false }
                    ]
                }
                """.formatted(subject.getId());

        String questionResponse = mockMvc.perform(post("/api/admin/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(questionPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.text").value("What is the primary role of the JVM?"))
                .andExpect(jsonPath("$.marks").value(5.0))
                .andReturn().getResponse().getContentAsString();

        // Parse Question ID
        long questionId = ((Number) org.springframework.boot.json.JsonParserFactory.getJsonParser().parseMap(questionResponse).get("id")).longValue();

        // 2. Admin assigns question to exam
        String assignPayload = """
                {
                    "questionIds": [%d]
                }
                """.formatted(questionId);

        mockMvc.perform(post("/api/admin/exams/" + exam.getId() + "/questions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionIds[0]").value(questionId))
                .andExpect(jsonPath("$.maximumMarks").value(5.0));

        // 3. Admin can view assigned questions with correct answer flag
        mockMvc.perform(get("/api/admin/exams/" + exam.getId() + "/questions")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(questionId))
                .andExpect(jsonPath("$[0].options[0].correct").value(true))
                .andExpect(jsonPath("$[0].options[1].correct").value(false));

        // 4. Student CANNOT access admin question view
        mockMvc.perform(get("/api/admin/exams/" + exam.getId() + "/questions")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 5. Student GET /api/exams/{id}/questions never exposes correct answer
        mockMvc.perform(get("/api/exams/" + exam.getId() + "/questions")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(questionId))
                .andExpect(jsonPath("$[0].options[0].text").value("Execute Java bytecode"))
                .andExpect(jsonPath("$[0].options[0].correct").doesNotExist());

        // 6. Admin can unassign the question from the exam
        mockMvc.perform(delete("/api/admin/exams/" + exam.getId() + "/questions/" + questionId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionIds", hasSize(0)))
                .andExpect(jsonPath("$.maximumMarks").value(0.0));
    }

    @Test
    void jwtServiceRejectsWeakOrMissingSecret() {
        org.springframework.mock.env.MockEnvironment devEnv = new org.springframework.mock.env.MockEnvironment();

        // 1. Missing secret
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class, () ->
                new JwtService("", 3600000, devEnv));

        // 2. Weak secret (< 32 bytes)
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () ->
                new JwtService("too-short-secret", 3600000, devEnv));

        // 3. Placeholder secret in production profile
        org.springframework.mock.env.MockEnvironment prodEnv = new org.springframework.mock.env.MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class, () ->
                new JwtService("local-only-secret-change-this-to-at-least-32-bytes-long", 3600000, prodEnv));

        // 4. Strong secret in production succeeds
        JwtService validProdJwt = new JwtService("c8f12a34b567890123456789abcdef0123456789abcdef0123456789abcdef", 3600000, prodEnv);
        String token = validProdJwt.generate("prod_test@example.com", "ADMIN");
        assertTrue(validProdJwt.isValid(token));
        assertEquals("prod_test@example.com", validProdJwt.extractEmail(token));
    }
}
