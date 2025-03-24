<<<<<<< HEAD
FROM openjdk:17-jdk-slim
RUN apt-get update && apt-get install -y curl telnet iputils-ping
WORKDIR /app
COPY target/communication_service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8083  
ENTRYPOINT ["java", "-jar", "app.jar"]
=======
# Use an official OpenJDK runtime as the base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Spring Boot JAR file into the container
COPY target/communication_service-0.0.1-SNAPSHOT.jar /app/communication_service.jar

# Expose the port (random port since server.port=0, but we'll map it in docker-compose)
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "/app/communication_service.jar"]
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7
