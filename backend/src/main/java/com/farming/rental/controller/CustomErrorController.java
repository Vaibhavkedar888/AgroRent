package com.farming.rental.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);

        Map<String, Object> errorDetails = new HashMap<>();

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            errorDetails.put("status", statusCode);

            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                errorDetails.put("error", "Resource not found");
            } else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                errorDetails.put("error", "Internal server error");
            } else if (statusCode == HttpStatus.FORBIDDEN.value()) {
                errorDetails.put("error", "Access denied");
            } else {
                errorDetails.put("error", message != null ? message : "An unexpected error occurred");
            }
            return ResponseEntity.status(statusCode).body(errorDetails);
        } else {
            errorDetails.put("status", 500);
            errorDetails.put("error", "An unexpected error occurred");
            return ResponseEntity.status(500).body(errorDetails);
        }
    }
}
