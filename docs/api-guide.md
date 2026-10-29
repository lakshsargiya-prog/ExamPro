# API Guide
Base URL: `http://localhost:8080`. Protected endpoints require `Authorization: Bearer <token>`.

## Authentication
- `POST /api/auth/register` — `{ "fullName":"Asha Student", "email":"asha@example.com", "password":"StudentPass123" }`
- `POST /api/auth/login` — `{ "email":"asha@example.com", "password":"StudentPass123" }`

## Subjects (admin writes)
- `GET /api/subjects`, `GET /api/subjects/{id}`
- `POST /api/admin/subjects`, `PUT /api/admin/subjects/{id}`, `DELETE /api/admin/subjects/{id}`
- Body: `{ "name":"Java", "description":"Java fundamentals" }`

## Questions (admin writes)
- `GET /api/questions`, `GET /api/questions/{id}`
- `POST /api/admin/questions`, `PUT /api/admin/questions/{id}`, `DELETE /api/admin/questions/{id}`
- Body: `{ "text":"Which keyword creates a subclass?", "subjectId":1, "difficulty":"EASY", "marks":2, "options":[{"text":"extends","correct":true},{"text":"implements","correct":false}] }`
- Public question DTOs omit the correctness flag.

## Exams
- `GET /api/exams`, `GET /api/exams/{id}`
- Admin: `POST /api/admin/exams`, `PUT /api/admin/exams/{id}`, `POST /api/admin/exams/{id}/questions`, `DELETE /api/admin/exams/{id}`
- Exam body: `{ "title":"Java Basics", "description":"Starter quiz", "durationMinutes":20, "passingPercentage":40, "availableFrom":null, "availableUntil":null }`
- Assign questions: `{ "questionIds":[1,2,3] }`

## Attempts and results
- `POST /api/exams/{examId}/attempts`
- `PUT /api/attempts/{attemptId}/answers` — `{ "answers":[{"questionId":1,"optionId":2}] }` (optionId null clears answer)
- `POST /api/attempts/{attemptId}/submit`
- `GET /api/results/my`, `GET /api/results/{attemptId}`, admin `GET /api/admin/results`

## Notes
- A student can have one in-progress attempt per exam. Retakes are allowed after a prior attempt is finalized.
- Scores are calculated server-side. A submitted score is never accepted from the client.
- Typical status codes: 200 success, 201 created, 204 deleted, 400 invalid request, 401 unauthenticated, 403 forbidden, 404 missing resource, 409 conflicting database data.
- Swagger UI: `http://localhost:8080/swagger-ui.html`.
