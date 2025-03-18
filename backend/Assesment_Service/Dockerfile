FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/Assesment_Service-3.4.1.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]