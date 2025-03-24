# Use an official OpenJDK runtime as the base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Spring Boot JAR file into the container
COPY target/tenant_service-0.0.1-SNAPSHOT.jar /app/tenant_service.jar

# Expose the port (random port since server.port=0, but we'll map it in docker-compose)
EXPOSE 8084

# Run the application
ENTRYPOINT ["java", "-jar", "/app/tenant_service.jar"]