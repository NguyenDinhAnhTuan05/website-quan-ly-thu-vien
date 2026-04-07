package com.nhom10.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminSeriesRequest {

    @NotBlank(message = "Tên bộ sách không được để trống")
    private String name;

    private String description;
    private String coverUrl;
}
