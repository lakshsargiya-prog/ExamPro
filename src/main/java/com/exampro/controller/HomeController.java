package com.exampro.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    private static final String LANDING_HTML = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ExamPro - Online Examination System</title>
                <style>
                    :root {
                        --primary: #2563eb;
                        --primary-hover: #1d4ed8;
                        --bg: #f8fafc;
                        --card-bg: #ffffff;
                        --text-main: #0f172a;
                        --text-muted: #64748b;
                        --border: #e2e8f0;
                        --success: #10b981;
                        --success-bg: #ecfdf5;
                        --tag-auth: #fef3c7;
                        --tag-auth-text: #92400e;
                        --tag-admin: #ede9fe;
                        --tag-admin-text: #5b21b6;
                        --tag-public: #dbeafe;
                        --tag-public-text: #1e40af;
                    }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        background-color: var(--bg);
                        color: var(--text-main);
                        line-height: 1.6;
                        padding: 2rem 1rem;
                    }
                    .container {
                        max-width: 920px;
                        margin: 0 auto;
                    }
                    header {
                        background: var(--card-bg);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 2rem;
                        margin-bottom: 1.5rem;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    }
                    .header-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 1rem;
                        margin-bottom: 0.75rem;
                    }
                    .brand {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }
                    .logo-icon {
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #2563eb, #3b82f6);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: 700;
                        font-size: 1.25rem;
                    }
                    h1 { font-size: 1.75rem; font-weight: 700; color: var(--text-main); }
                    .subtitle { color: var(--text-muted); font-size: 1rem; }
                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        background-color: var(--success-bg);
                        color: #065f46;
                        border: 1px solid #a7f3d0;
                        padding: 0.35rem 0.75rem;
                        border-radius: 9999px;
                        font-size: 0.875rem;
                        font-weight: 600;
                    }
                    .pulse-dot {
                        width: 8px;
                        height: 8px;
                        background-color: var(--success);
                        border-radius: 50%;
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                    }
                    .actions {
                        display: flex;
                        gap: 0.75rem;
                        flex-wrap: wrap;
                        margin-top: 1.25rem;
                    }
                    .btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.6rem 1.25rem;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 0.925rem;
                        transition: all 0.15s ease-in-out;
                    }
                    .btn-primary { background-color: var(--primary); color: white; border: none; }
                    .btn-primary:hover { background-color: var(--primary-hover); }
                    .btn-secondary { background-color: white; color: var(--text-main); border: 1px solid var(--border); }
                    .btn-secondary:hover { background-color: #f1f5f9; }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 1.25rem;
                        margin-bottom: 1.5rem;
                    }
                    .card {
                        background: var(--card-bg);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 1.5rem;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    }
                    .card h2 {
                        font-size: 1.15rem;
                        margin-bottom: 1rem;
                        color: var(--text-main);
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    .info-list { list-style: none; }
                    .info-list li {
                        display: flex;
                        justify-content: space-between;
                        padding: 0.5rem 0;
                        border-bottom: 1px solid #f1f5f9;
                        font-size: 0.9rem;
                    }
                    .info-list li:last-child { border-bottom: none; }
                    .info-label { color: var(--text-muted); }
                    .info-value { font-weight: 600; }
                    .tag {
                        padding: 0.2rem 0.5rem;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: 600;
                    }
                    .tag-public { background: var(--tag-public); color: var(--tag-public-text); }
                    .tag-auth { background: var(--tag-auth); color: var(--tag-auth-text); }
                    .tag-admin { background: var(--tag-admin); color: var(--tag-admin-text); }
                    .api-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.875rem;
                        margin-top: 0.5rem;
                    }
                    .api-table th, .api-table td {
                        text-align: left;
                        padding: 0.6rem 0.75rem;
                        border-bottom: 1px solid var(--border);
                    }
                    .api-table th { background: #f8fafc; color: var(--text-muted); font-weight: 600; }
                    .method { font-family: monospace; font-weight: 700; font-size: 0.8rem; }
                    .method-get { color: #0284c7; }
                    .method-post { color: #16a34a; }
                    .method-put { color: #d97706; }
                    .method-delete { color: #dc2626; }
                    .notice-card {
                        background: #eff6ff;
                        border: 1px solid #bfdbfe;
                        border-radius: 10px;
                        padding: 1rem 1.25rem;
                        margin-bottom: 1.5rem;
                        font-size: 0.9rem;
                        color: #1e40af;
                    }
                    footer {
                        text-align: center;
                        font-size: 0.85rem;
                        color: var(--text-muted);
                        padding: 1rem 0;
                    }
                </style>
            </head>
            <body>
            <div class="container">
                <header>
                    <div class="header-top">
                        <div class="brand">
                            <div class="logo-icon">&#10003;</div>
                            <div>
                                <h1>ExamPro</h1>
                                <div class="subtitle">Online Examination & Assessment System</div>
                            </div>
                        </div>
                        <div class="status-badge">
                            <span class="pulse-dot"></span>
                            <span>System Operational</span>
                        </div>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.5rem;">
                        ExamPro backend services are active. Complete REST API with JWT security, online examinations, question banks, and grading are ready.
                    </p>
                    <div class="actions">
                        <a href="/swagger-ui.html" class="btn btn-primary" target="_blank">&#9881; Interactive Swagger UI</a>
                        <a href="/v3/api-docs" class="btn btn-secondary" target="_blank">&#128196; OpenAPI Docs (JSON)</a>
                        <a href="/api/status" class="btn btn-secondary">&#128225; System Status (JSON)</a>
                    </div>
                </header>

                <div class="notice-card">
                    <strong>&#128736; Frontend Status:</strong> The frontend client is currently under construction. You can interact with and test all backend APIs immediately via Swagger UI or any HTTP client using the endpoints documented below.
                </div>

                <div class="grid">
                    <div class="card">
                        <h2>&#128202; System Overview</h2>
                        <ul class="info-list">
                            <li><span class="info-label">Application</span><span class="info-value">ExamPro Backend</span></li>
                            <li><span class="info-label">Version</span><span class="info-value">1.0.0</span></li>
                            <li><span class="info-label">Framework</span><span class="info-value">Spring Boot 3.5.6</span></li>
                            <li><span class="info-label">Java Version</span><span class="info-value">Java 21</span></li>
                            <li><span class="info-label">Authentication</span><span class="info-value">Stateless JWT (HMAC-SHA)</span></li>
                            <li><span class="info-label">Database</span><span class="info-value">Spring Data JPA / MySQL</span></li>
                        </ul>
                    </div>
                    <div class="card">
                        <h2>&#128273; Authentication Guide</h2>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">
                            Protected endpoints require a Bearer token in the <code>Authorization</code> header:
                        </p>
                        <ol style="font-size: 0.875rem; color: var(--text-main); padding-left: 1.25rem; line-height: 1.7;">
                            <li>Create an account: <code>POST /api/auth/register</code></li>
                            <li>Or sign in: <code>POST /api/auth/login</code></li>
                            <li>Copy the returned <code>token</code></li>
                            <li>Send header: <code>Authorization: Bearer &lt;token&gt;</code></li>
                            <li>In Swagger UI, click <strong>Authorize</strong> and paste your token.</li>
                        </ol>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 1.5rem;">
                    <h2>&#128225; Key API Endpoints</h2>
                    <div style="overflow-x: auto;">
                        <table class="api-table">
                            <thead>
                                <tr>
                                    <th>Access</th>
                                    <th>Method</th>
                                    <th>Endpoint</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="tag tag-public">Public</span></td>
                                    <td><span class="method method-get">GET</span></td>
                                    <td><code>/</code></td>
                                    <td>Landing & Status Page</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-public">Public</span></td>
                                    <td><span class="method method-post">POST</span></td>
                                    <td><code>/api/auth/register</code></td>
                                    <td>Student / Teacher Registration</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-public">Public</span></td>
                                    <td><span class="method method-post">POST</span></td>
                                    <td><code>/api/auth/login</code></td>
                                    <td>User Login (returns JWT)</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-auth">Auth Required</span></td>
                                    <td><span class="method method-get">GET</span></td>
                                    <td><code>/api/exams</code></td>
                                    <td>List Available Examinations</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-auth">Auth Required</span></td>
                                    <td><span class="method method-post">POST</span></td>
                                    <td><code>/api/exams/{id}/attempts</code></td>
                                    <td>Start Exam Attempt</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-auth">Auth Required</span></td>
                                    <td><span class="method method-put">PUT</span></td>
                                    <td><code>/api/attempts/{id}/answers</code></td>
                                    <td>Save Answers During Exam</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-auth">Auth Required</span></td>
                                    <td><span class="method method-post">POST</span></td>
                                    <td><code>/api/attempts/{id}/submit</code></td>
                                    <td>Submit Exam for Evaluation</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-auth">Auth Required</span></td>
                                    <td><span class="method method-get">GET</span></td>
                                    <td><code>/api/results/my</code></td>
                                    <td>View Personal Exam Results</td>
                                </tr>
                                <tr>
                                    <td><span class="tag tag-admin">Admin Only</span></td>
                                    <td><span class="method method-post">POST</span></td>
                                    <td><code>/api/admin/exams</code></td>
                                    <td>Create New Examination</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer>
                    &copy; 2026 ExamPro. Online Examination and Assessment System. All rights reserved.
                </footer>
            </div>
            </body>
            </html>
            """;

    @GetMapping(value = {"/", "/index.html"}, produces = MediaType.TEXT_HTML_VALUE)
    public String home() {
        return LANDING_HTML;
    }

    @GetMapping(value = "/api/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("application", "ExamPro");
        body.put("description", "Online Examination and Assessment System");
        body.put("version", "1.0.0");
        body.put("status", "UP");
        body.put("timestamp", Instant.now().toString());
        body.put("swaggerUi", "/swagger-ui.html");
        body.put("apiDocs", "/v3/api-docs");
        return ResponseEntity.ok(body);
    }
}

