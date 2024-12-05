package com.schoolmanagement.User_Service.exception;

public class TokenExpiredException  extends RuntimeException  {
    public TokenExpiredException(String message) {
        super(message);
    }
}
