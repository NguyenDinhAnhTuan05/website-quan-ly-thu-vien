package com.nhom10.library.dto.request;

import com.nhom10.library.entity.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Yêu cầu thay đổi vai trò (role) của người dùng.
 * Chỉ Admin/Super-Admin mới có quyền gọi endpoint này.
 */
@Data
public class ChangeRoleRequest {

    @NotNull(message = "Role không được để trống")
    private Role role;
}
