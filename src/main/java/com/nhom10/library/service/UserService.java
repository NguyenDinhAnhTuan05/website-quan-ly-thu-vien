package com.nhom10.library.service;

import com.nhom10.library.dto.request.ChangePasswordRequest;
import com.nhom10.library.dto.request.UpdateProfileRequest;
import com.nhom10.library.dto.response.UserResponse;
import com.nhom10.library.entity.User;
import com.nhom10.library.entity.UserSubscription;
import com.nhom10.library.entity.enums.Role;
import com.nhom10.library.entity.enums.SubscriptionStatus;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ForbiddenException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.UserRepository;
import com.nhom10.library.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    // ================================================================
    // READ — Dành cho Admin quản lý
    // ================================================================

    /** Lấy danh sách tất cả users (phân trang) — bao gồm thông tin gói đăng ký */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        return enrichWithSubscriptions(userPage);
    }

    /** Lấy chi tiết 1 user theo ID */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return UserResponse.from(findById(id));
    }

    // ================================================================
    // TOGGLE STATUS — Bật/Tắt tài khoản người dùng
    // ================================================================

    /**
     * Admin bật/tắt trạng thái enabled của user.
     *
     * Ràng buộc:
     *   - Admin không thể tắt tài khoản của chính mình.
     *   - Admin chỉ quản lý được user có role THẤP HƠN mình.
     *     VD: ROLE_ADMIN không thể toggle ROLE_ADMIN hoặc ROLE_SUPER_ADMIN.
     *
     * @param adminId  ID admin đang thực hiện thao tác.
     * @param targetId ID user cần toggle.
     */
    @Transactional
    public UserResponse toggleUserStatus(Long adminId, Long targetId) {
        User admin = findById(adminId);
        User target = findById(targetId);

        // Tự bảo vệ: không toggle chính mình
        if (adminId.equals(targetId)) {
            throw new ForbiddenException("Bạn không thể bật/tắt tài khoản của chính mình.");
        }

        // Phân cấp: chỉ quản lý user có level thấp hơn
        if (!admin.getRole().canManage(target.getRole())) {
            throw new ForbiddenException(
                "Bạn không có quyền thay đổi trạng thái tài khoản của "
                + target.getRole() + ". Chỉ có thể quản lý người dùng có cấp thấp hơn."
            );
        }

        target.setEnabled(!target.isEnabled());
        User saved = userRepository.save(target);
        log.info("Admin {} thay đổi trạng thái user ID={} → enabled={}", adminId, targetId, saved.isEnabled());
        return UserResponse.from(saved);
    }

    // ================================================================
    // DELETE — Soft Delete user
    // ================================================================

    /**
     * Admin xóa mềm user.
     *
     * Ràng buộc:
     *   - Admin không thể xóa chính mình.
     *   - Admin chỉ xóa được user có role THẤP HƠN mình.
     *
     * @param adminId  ID admin đang thực hiện thao tác.
     * @param targetId ID user cần xóa.
     */
    @Transactional
    public void deleteUser(Long adminId, Long targetId) {
        User admin = findById(adminId);
        User target = findById(targetId);

        // Tự bảo vệ: không xóa chính mình
        if (adminId.equals(targetId)) {
            throw new ForbiddenException("Bạn không thể xóa tài khoản của chính mình.");
        }

        // Phân cấp: chỉ xóa được user có level thấp hơn
        if (!admin.getRole().canManage(target.getRole())) {
            throw new ForbiddenException(
                "Bạn không có quyền xóa tài khoản " + target.getRole()
                + ". Chỉ có thể quản lý người dùng có cấp thấp hơn."
            );
        }

        userRepository.delete(target);
        log.info("Admin {} xóa (soft) user ID={}", adminId, targetId);
    }

    // ================================================================
    // CHANGE ROLE — Thay đổi vai trò người dùng (theo phân cấp)
    // ================================================================

    /**
     * Admin thay đổi role của user khác.
     *
     * Ràng buộc:
     *   - Admin không thể thay đổi role của chính mình.
     *   - Admin chỉ thay đổi được role của user có level THẤP HƠN mình.
     *   - Admin chỉ được gán role THẤP HƠN cấp của mình cho người khác.
     *     VD: ROLE_ADMIN có thể gán ROLE_USER hoặc ROLE_ADMIN,
     *         nhưng KHÔNG được gán ROLE_SUPER_ADMIN.
     *
     * @param adminId   ID admin đang thực hiện.
     * @param targetId  ID user cần thay đổi role.
     * @param newRole   Role mới muốn gán.
     */
    @Transactional
    public UserResponse changeUserRole(Long adminId, Long targetId, Role newRole) {
        User admin = findById(adminId);
        User target = findById(targetId);

        // Không đổi role của chính mình
        if (adminId.equals(targetId)) {
            throw new ForbiddenException("Bạn không thể thay đổi role của chính mình.");
        }

        // Chỉ quản lý được user có level thấp hơn
        if (!admin.getRole().canManage(target.getRole())) {
            throw new ForbiddenException(
                "Bạn không có quyền thay đổi role của " + target.getRole()
                + ". Chỉ có thể quản lý người dùng có cấp thấp hơn."
            );
        }

        // Chỉ được gán role thấp hơn cấp của mình (không tự nâng người khác lên ngang/trên mình)
        if (!admin.getRole().canManage(newRole)) {
            throw new ForbiddenException(
                "Bạn không có quyền gán role " + newRole
                + ". Chỉ được gán role có cấp thấp hơn cấp của bạn (" + admin.getRole() + ")."
            );
        }

        Role oldRole = target.getRole();
        target.setRole(newRole);
        User saved = userRepository.save(target);
        log.info("Admin {} đổi role user ID={} từ {} → {}", adminId, targetId, oldRole, newRole);
        return UserResponse.from(saved);
    }

    // ================================================================
    // SEARCH — Tìm kiếm theo email hoặc username (cho Admin)
    // ================================================================

    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        Page<User> userPage = userRepository.searchByEmailOrUsername(keyword, pageable);
        return enrichWithSubscriptions(userPage);
    }

    // ================================================================
    // PROFILE — Người dùng tự cập nhật thông tin cá nhân
    // ================================================================

    /**
     * Lấy thông tin hồ sơ của user hiện tại.
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return UserResponse.from(findById(userId));
    }

    /**
     * Cập nhật tên hiển thị và ảnh đại diện.
     * Username phải unique — kiểm tra trùng với user khác.
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findById(userId);

        // Kiểm tra username trùng với người khác
        userRepository.findByUsername(request.getUsername()).ifPresent(existing -> {
            if (!existing.getId().equals(userId)) {
                throw new BadRequestException("Tên người dùng '" + request.getUsername() + "' đã được sử dụng.");
            }
        });

        user.setUsername(request.getUsername());
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().isBlank() ? null : request.getAvatarUrl().trim());
        }
        User saved = userRepository.save(user);
        log.info("User ID={} cập nhật hồ sơ: username={}", userId, saved.getUsername());
        return UserResponse.from(saved);
    }

    /**
     * Đổi mật khẩu — yêu cầu xác nhận mật khẩu cũ.
     * Không cho phép với tài khoản OAuth2 (không có password local).
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findById(userId);

        if (user.getPassword() == null) {
            throw new BadRequestException("Tài khoản OAuth2 không hỗ trợ đổi mật khẩu.");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("User ID={} đổi mật khẩu thành công.", userId);
    }

    // ================================================================
    // PRIVATE HELPER
    // ================================================================

    /** Batch-enrich user page with active subscription info */
    private Page<UserResponse> enrichWithSubscriptions(Page<User> userPage) {
        List<Long> userIds = userPage.getContent().stream().map(User::getId).collect(Collectors.toList());
        if (userIds.isEmpty()) {
            return userPage.map(UserResponse::from);
        }
        Map<Long, UserSubscription> activeSubMap = userSubscriptionRepository
                .findByUserIdInAndStatus(userIds, SubscriptionStatus.ACTIVE)
                .stream()
                .collect(Collectors.toMap(
                        sub -> sub.getUser().getId(),
                        sub -> sub,
                        (a, b) -> a.getEndDate().isAfter(b.getEndDate()) ? a : b // lấy gói kết thúc muộn nhất
                ));
        return userPage.map(user -> UserResponse.fromWithSubscription(user, activeSubMap.get(user.getId())));
    }

    private User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
