# ==========================================
# Multi-stage Dockerfile for ExamPro Backend
# Optimized for Render Free Tier (512MB RAM)
# ==========================================

# Stage 1: Build JAR using Maven and Eclipse Temurin JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and compile
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime image using minimal Eclipse Temurin JRE 21
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root system user and group for security
RUN addgroup -S exampro && adduser -S exampro -G exampro

# Copy fat JAR from builder stage
COPY --from=builder /build/target/*.jar /app/app.jar
RUN chown -R exampro:exampro /app

# Switch to non-root user
USER exampro:exampro

# Default port (Render injects dynamic $PORT at runtime)
ENV PORT=8080
EXPOSE 8080

# Health check using lightweight wget against public /api/status endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/status || exit 1

# Launch Spring Boot with memory optimization for Render's 512MB limit:
# - MaxRAMPercentage=75.0 caps JVM heap at ~384MB
# - ExitOnOutOfMemoryError ensures clean restart on unexpected pressure
# - exec ensures Java is PID 1 to handle SIGTERM gracefully
ENTRYPOINT ["sh", "-c", "exec java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=35.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]

