package com.nhom10.library.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class AdminBookRequest {

    @NotBlank(message = "Tên sách không được để trống")
    private String title;

    private String isbn;
    private String description;
    private String coverUrl;

    @Min(value = 1, message = "Số bản sách tối thiểu là 1")
    private int quantity;

    private boolean available = true;

    private LocalDate publishedDate;

    // Chỉ nhận mảng ID (VD: [1, 2]) để Link bảng phụ
    private Set<Long> categoryIds;
    private Set<Long> authorIds;
}
