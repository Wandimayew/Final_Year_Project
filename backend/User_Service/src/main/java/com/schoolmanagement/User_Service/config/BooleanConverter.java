package com.schoolmanagement.User_Service.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BooleanConverter implements AttributeConverter<Boolean, String> {
    @Override
    public String convertToDatabaseColumn(Boolean attribute) {
        return (attribute != null && attribute) ? "1" : "0";
    }

    @Override
    public Boolean convertToEntityAttribute(String dbData) {
        return dbData == null || dbData.isEmpty() || dbData.equals("1");
    }
}