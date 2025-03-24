package com.schoolmanagement.User_Service.config;

import java.lang.annotation.ElementType; // Import ElementType
import java.lang.annotation.Retention; // Already present, but kept for clarity
import java.lang.annotation.RetentionPolicy; // Import RetentionPolicy
import java.lang.annotation.Target; // Already present, but kept for clarity

@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface JwtToken {
}