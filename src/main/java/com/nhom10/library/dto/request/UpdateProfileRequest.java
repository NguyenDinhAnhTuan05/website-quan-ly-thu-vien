package com.nhom10.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Tên người dùng không được để trống.")
    @Size(min = 3, max = 50, message = "Tên người dùng phải từ 3 đến 50 ký tự.")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Tên người dùng chỉ được chứa chữ, số và dấu gạch dưới.")
    private String username;

    @Size(max = 500, message = "URL ảnh đại diện không được vượt quá 500 ký tự.")
    private String avatarUrl;
}
