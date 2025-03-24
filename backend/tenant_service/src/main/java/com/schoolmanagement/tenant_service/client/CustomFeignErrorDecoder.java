package com.schoolmanagement.tenant_service.client;

import feign.Response;
import feign.codec.ErrorDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CustomFeignErrorDecoder implements ErrorDecoder {

    private static final Logger log = LoggerFactory.getLogger(CustomFeignErrorDecoder.class);

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("Feign error for method {}: Status {}", methodKey, response.status());
        switch (response.status()) {
            case 403:
                return new SecurityException("Forbidden: Invalid service token or insufficient permissions");
            case 401:
                return new SecurityException("Unauthorized: Invalid user token");
            case 503:
                return new RuntimeException("Service unavailable: UserService is down");
            default:
                return new RuntimeException("Unexpected error from UserService: " + response.status());
        }
    }
}