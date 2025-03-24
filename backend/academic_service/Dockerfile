# Use an official OpenJDK runtime as the base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Spring Boot JAR file into the container
COPY target/academic_service-0.0.1-SNAPSHOT.jar /app/academic_service.jar

# Expose the port (random port since server.port=0, but we'll map it in docker-compose)
EXPOSE 8082

# Run the application
ENTRYPOINT ["java", "-jar", "/app/academic_service.jar"]