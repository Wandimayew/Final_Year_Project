FROM openjdk:17-jdk-slim
RUN apt-get update && apt-get install -y curl telnet iputils-ping
WORKDIR /app
COPY target/Staff_Service-3.4.1.jar app.jar
RUN mkdir -p /uploads/qrcodes
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]