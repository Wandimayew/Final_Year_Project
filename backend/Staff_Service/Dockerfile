FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/Staff_Service-3.4.1.jar app.jar
RUN mkdir -p /uploads/qrcodes
EXPOSE 8081  
ENTRYPOINT ["java", "-jar", "app.jar"]