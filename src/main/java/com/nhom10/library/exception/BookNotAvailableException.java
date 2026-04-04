package com.nhom10.library.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ném khi sách hết bản hoặc admin đã tắt trạng thái mượn.
 * HTTP 409 Conflict — tài nguyên tồn tại nhưng có xung đột trạng thái.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class BookNotAvailableException extends RuntimeException {

    public BookNotAvailableException(String bookTitle) {
        super("Sách '" + bookTitle + "' hiện không còn bản để mượn.");
    }
}
