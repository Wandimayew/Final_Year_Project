FROM openjdk:17-jdk-slim
RUN apt-get update && apt-get install -y curl telnet iputils-ping
WORKDIR /app
COPY target/Assessment_Service-3.4.1.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]