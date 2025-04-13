// package com.schoolmanagement.api_gateway;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.http.HttpMethod;
// import org.springframework.cloud.gateway.filter.GlobalFilter;
// import org.springframework.cloud.gateway.route.RouteLocator;
// import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
// import org.springframework.core.Ordered;
// import org.springframework.core.annotation.Order;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.server.reactive.ServerHttpResponse;
// import reactor.core.publisher.Mono;

// @Configuration
// public class AppConfig {

//     // Global Filter to enforce Gateway's CORS policy with highest precedence
//     @Bean
//     @Order(Ordered.HIGHEST_PRECEDENCE) // Ensure this runs before other filters
//     public GlobalFilter corsGlobalFilter() {
//         return (exchange, chain) -> {
//             ServerHttpResponse response = exchange.getResponse();
//             HttpHeaders headers = response.getHeaders();

//             // Handle OPTIONS (preflight) requests
//             if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_MAX_AGE);

//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PUT,DELETE,PATCH,OPTIONS");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");

//                 response.setStatusCode(org.springframework.http.HttpStatus.OK);
//                 return Mono.empty();
//             }

//             // Process regular requests and override downstream CORS headers
//             return chain.filter(exchange).then(Mono.fromRunnable(() -> {
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
//                 headers.remove(HttpHeaders.ACCESS_CONTROL_MAX_AGE);

//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PUT,DELETE,PATCH,OPTIONS");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "*");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
//                 headers.add(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "3600");
//             }));
//         };
//     }

//     // Route configuration for Spring Cloud Gateway

// }