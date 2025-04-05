FROM openjdk:17-jdk-slim
RUN apt-get update && apt-get install -y curl
WORKDIR /app
COPY target/service-registry-0.0.1-SNAPSHOT.jar /app/service-registry.jar
EXPOSE 8761 
CMD ["java", "-jar", "service-registry.jar"]
