package com.nhom10.library.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Xử lý Exception tập trung cho toàn bộ REST API.
 *
 * Nguyên tắc:
 *  - KHÔNG để lộ stack trace ra response (đã config trong application.yml).
 *  - Log đầy đủ ở server side để debug.
 *  - Trả về error response chuẩn JSON với: timestamp, status, error, message, path.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ================================================================
    // 400 — VALIDATION ERRORS
    // ================================================================

    /**
     * @Valid trên @RequestBody thất bại → MethodArgumentNotValidException.
     * Trả về tất cả field errors trong một response duy nhất.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Giá trị không hợp lệ",
                (existing, replacement) -> existing // Giữ lỗi đầu tiên nếu field trùng
            ));

        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ",
            request, Map.of("errors", fieldErrors));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            BadRequestException ex, WebRequest request) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    @ExceptionHandler(InvalidBorrowStatusException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidBorrowStatus(
            InvalidBorrowStatusException ex, WebRequest request) {
        log.warn("Invalid borrow status: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    // ================================================================
    // 401 — AUTHENTICATION ERRORS
    // ================================================================

    /**
     * Spring Security method-level security (@PreAuthorize) throws AuthenticationException
     * khi user chưa đăng nhập. Nếu không bắt ở đây, catch-all Exception sẽ trả về 500.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
            "Vui lòng đăng nhập để tiếp tục.", request, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        // Không log chi tiết — tránh credential stuffing log spam
        return buildErrorResponse(HttpStatus.UNAUTHORIZED,
            "Email hoặc mật khẩu không đúng.", request, null);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, Object>> handleDisabled(
            DisabledException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request, null);
    }

    // ================================================================
    // 403 — FORBIDDEN
    // ================================================================

    /**
     * Spring Security method-level security (@PreAuthorize) throws AccessDeniedException
     * khi user đã đăng nhập nhưng không có quyền. Nếu không bắt ở đây, catch-all
     * Exception sẽ trả về 500 thay vì 403.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.FORBIDDEN,
            "Bạn không có quyền thực hiện hành động này.", request, null);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(
            ForbiddenException ex, WebRequest request) {
        log.warn("Forbidden: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request, null);
    }

    // ================================================================
    // 404 — NOT FOUND
    // ================================================================

    /**
     * Spring 6.x / Spring Boot 3.x: NoResourceFoundException khi không tìm thấy handler
     * cho path được yêu cầu (thay thế NoHandlerFoundException trong Spring 5.x).
     * Nếu không bắt ở đây, catch-all Exception trả về 500 sai.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(
            NoResourceFoundException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND,
            "Không tìm thấy tài nguyên yêu cầu.", request, null);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    // ================================================================
    // 409 — CONFLICT
    // ================================================================

    @ExceptionHandler(BookNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleBookNotAvailable(
            BookNotAvailableException ex, WebRequest request) {
        log.info("Book not available: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), request, null);
    }

    // ================================================================
    // 500 — UNEXPECTED ERRORS (catch-all)
    // ================================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error at '{}': [{}] {}",
            request.getDescription(false), ex.getClass().getSimpleName(), ex.getMessage());
        log.debug("Full stack trace for debugging:", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
            "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.", request, null);
    }

    // ================================================================
    // PRIVATE BUILDER
    // ================================================================

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status, String message, WebRequest request,
            Map<String, Object> extraFields) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", request.getDescription(false).replace("uri=", ""));
        if (extraFields != null) {
            body.putAll(extraFields);
        }
        return ResponseEntity.status(status).body(body);
    }
}
