package com.nhom10.library.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BorrowRequest {

    @NotEmpty(message = "Danh sách sách không được rỗng")
    @Size(max = 5, message = "Mỗi lần mượn tối đa 5 cuốn sách")
    private List<Long> bookIds;

    private String note;
}
