FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/service_registry-0.0.1-SNAPSHOT.jar /app/service_registry.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "/app/service_registry.jar"]