FROM openjdk:17-jdk-slim
RUN apt-get update && apt-get install -y curl telnet iputils-ping
WORKDIR /app
COPY target/academic_service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081  
ENTRYPOINT ["java", "-jar", "app.jar"]
