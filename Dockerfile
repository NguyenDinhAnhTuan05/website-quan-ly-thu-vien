# ============================================================
# Multi-stage Dockerfile - Library Management System
# Build: React (Node.js) + Java SpringBoot (Maven)
# Final: Optimized Java Runtime
# ============================================================

# ============================================================
# STAGE 1: Build React Frontend
# ============================================================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source files
COPY frontend/ ./

# Build frontend - output to /app/src/main/resources/static
RUN mkdir -p /app/src/main/resources/static && npm run build

# ============================================================
# STAGE 2: Build Java Backend with Maven
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app

# Copy Maven files
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn ./.mvn

# Copy source code
COPY src ./src

# Copy built frontend from stage 1
COPY --from=frontend-build /app/src/main/resources/static ./src/main/resources/static

# Build application with Maven
# Skip tests in Docker build for faster build time
RUN mvn clean package -DskipTests -e

# ============================================================
# STAGE 3: Runtime - Optimized Java Image
# ============================================================
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1000 -S appuser && adduser -u 1000 -S appuser -G appuser

# Install curl for health checks (optional but recommended)
RUN apk add --no-cache curl

# Copy JAR from build stage
COPY --from=backend-build /app/target/library-1.0.0.jar ./app.jar

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Set JVM options for better performance and container support
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.awt.headless=true"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
