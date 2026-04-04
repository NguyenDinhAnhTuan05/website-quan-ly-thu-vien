package com.nhom10.library.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ném khi thực hiện thao tác không hợp lệ với trạng thái phiếu mượn.
 * Ví dụ: trả sách đã trả rồi, duyệt phiếu đã duyệt...
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidBorrowStatusException extends RuntimeException {

    public InvalidBorrowStatusException(String message) {
        super(message);
    }
}
