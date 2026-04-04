package com.nhom10.library.entity.enums;

/**
 * Nguồn xác thực của người dùng.
 * LOCAL: Đăng ký bằng form
 * GOOGLE / GITHUB: Đăng nhập qua OAuth2
 */
public enum AuthProvider {
    LOCAL,
    GOOGLE,
    GITHUB
}
