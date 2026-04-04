package com.nhom10.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthorRequest {

    @NotBlank(message = "Tên tác giả không được để trống")
    @Size(max = 150, message = "Tên tác giả tối đa 150 ký tự")
    private String name;

    private String bio;

    @Size(max = 500, message = "URL ảnh đại diện tối đa 500 ký tự")
    private String avatarUrl;
}
