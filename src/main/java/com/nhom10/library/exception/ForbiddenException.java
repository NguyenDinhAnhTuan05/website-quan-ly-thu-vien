package com.nhom10.library.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ném khi người dùng đã xác thực nhưng không đủ quyền thực hiện hành động.
 * HTTP 403 Forbidden — khác với 401 Unauthorized (chưa xác thực).
 *
 * VD: Admin cố thay đổi role của Admin khác cùng cấp,
 *     User cố xóa review của người khác,...
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
