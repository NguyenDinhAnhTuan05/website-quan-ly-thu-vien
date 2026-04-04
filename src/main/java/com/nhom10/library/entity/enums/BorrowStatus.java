package com.nhom10.library.entity.enums;

/**
 * Trạng thái phiếu mượn sách.
 *
 * Vòng đời trạng thái:
 *   PENDING   → BORROWING (Admin duyệt)
 *   PENDING   → CANCELLED (User tự hủy, chỉ khi PENDING)
 *   PENDING   → REJECTED  (Admin từ chối, chỉ khi PENDING)
 *   BORROWING → RETURNED  (Admin xác nhận trả)
 *   BORROWING → OVERDUE   (Cron job tự động khi quá hạn)
 *   OVERDUE   → RETURNED  (Admin xác nhận trả muộn)
 */
public enum BorrowStatus {
    /** Chờ thủ thư xác nhận */
    PENDING,
    /** Đang mượn (đã được duyệt) */
    BORROWING,
    /** Đã trả sách */
    RETURNED,
    /** Quá hạn trả (tự động cập nhật bởi Scheduled job) */
    OVERDUE,
    /** Người dùng tự hủy phiếu (khi còn PENDING) */
    CANCELLED,
    /** Admin từ chối phiếu mượn (khi còn PENDING) */
    REJECTED
}
