# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom first so dependency layer is cached
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
# Using jammy (Ubuntu) NOT alpine — alpine's musl libc breaks Spring Boot 3
# nested JAR classloading (missing logback ThrowableProxy class)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/rental-system-1.0.0.jar app.jar

# Render injects PORT env var; Spring reads it via ${PORT:8080}
EXPOSE 8080

# Increase MongoDB server selection timeout to handle Atlas SRV DNS cold start
ENV JAVA_OPTS="-Xmx256m -Xms128m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
