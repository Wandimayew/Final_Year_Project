package com.schoolmanagement.User_Service.security;

import java.util.Base64;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class KeyGen {
    public static void main(String[] args) throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
        keyGen.init(256); 
        SecretKey secretKey = keyGen.generateKey();
        String base64Key = Base64.getEncoder().encodeToString(secretKey.getEncoded());
        System.out.println("Base64 Encoded Key: " + base64Key);
    }
}
