package com.schoolmanagement.finance_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.schoolmanagement.finance_service.dto.ChapaInitiatePaymentRequest;
import com.schoolmanagement.finance_service.dto.ChapaInitiatePaymentResponse;
import com.schoolmanagement.finance_service.dto.ChapaVerifyPaymentResponse;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChapaPaymentService {

    private final RestTemplate restTemplate;
    
    @Value("${chapa.api.url}")
    private String chapaApiUrl;
    
    @Value("${chapa.secret.key}")
    private String chapaSecretKey;
    
    @Value("${chapa.callback.url}")
    private String callbackUrl;

    private final ObjectMapper objectMapper;

    // public ChapaPaymentService() {
    //     this.restTemplate = new RestTemplate();
    //     this.objectMapper = new ObjectMapper();
    //     this.objectMapper.registerModule(new JavaTimeModule());
    // }
    
    /**
     * Initiates a payment with Chapa payment gateway
     * 
     * @param request Payment details
     * @return Response containing checkout URL
     */
    public ChapaInitiatePaymentResponse initiatePayment(ChapaInitiatePaymentRequest request) {
        try {
            HttpHeaders headers = createHeaders();
            
            // Generate a unique transaction reference
            String txRef = "TX-" + UUID.randomUUID().toString();
            request.setTxRef(txRef);
            
            // Set callback URL if not provided
            if (request.getCallbackUrl() == null || request.getCallbackUrl().isEmpty()) {
                request.setCallbackUrl(callbackUrl);
            }

            // Make API call to Chapa
            HttpEntity<ChapaInitiatePaymentRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    chapaApiUrl + "/transaction/initialize",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            // Log the raw API response
            log.info("API Response: {}", responseEntity.getBody());
        
            // Deserialize the response
            ChapaInitiatePaymentResponse response = objectMapper.readValue(responseEntity.getBody(), ChapaInitiatePaymentResponse.class);

            // Manually set the txRef in the response
            if (response.getData() == null) {
                response.setData(new ChapaInitiatePaymentResponse.ChapaDataResponse());
            }
            response.getData().setTxRef(txRef); // Set the txRef in the response

            return response;
            
        } catch (Exception e) {
            log.error("Error initializing Chapa payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initiate Chapa payment: " + e.getMessage());
        }
    }
    
    /**
     * Verifies a payment transaction with Chapa
     * 
     * @param txRef Transaction reference to verify
     * @return Verification response
     */
    public ChapaVerifyPaymentResponse verifyPayment(String txRef) {
        try {
            HttpHeaders headers = createHeaders();
            
            // Make API call to verify transaction
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    chapaApiUrl + "/transaction/verify/" + txRef,
                    HttpMethod.GET,
                    entity,
                    String.class
            );


            // Deserialize the response
            return objectMapper.readValue(responseEntity.getBody(), ChapaVerifyPaymentResponse.class);
            
        } catch (HttpClientErrorException e) {
            log.error("Chapa API error: {}", e.getResponseBodyAsString(), e);
            throw new RuntimeException("Failed to verify Chapa payment: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("Error verifying Chapa payment: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to verify Chapa payment: " + e.getMessage(), e);
        }
    }
    
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + chapaSecretKey);
        return headers;
    }
}
