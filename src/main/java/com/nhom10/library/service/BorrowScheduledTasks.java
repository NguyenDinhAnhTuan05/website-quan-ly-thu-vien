package com.nhom10.library.service;

import com.nhom10.library.entity.BorrowRecord;
import com.nhom10.library.entity.enums.BorrowStatus;
import com.nhom10.library.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@EnableScheduling // Kích hoạt khả năng chạy ngầm Scheduled
@RequiredArgsConstructor
@Slf4j
public class BorrowScheduledTasks {

    private final BorrowRecordRepository borrowRecordRepository;

    /**
     * Tự động quét các phiếu mượn (BORROWING) quá hạn và đổi sang (OVERDUE).
     * Chạy mỗi ngày lúc 00:01 sáng.
     * Cú pháp Cron: Giây Phút Giờ Ngày Tháng Ngày_trong_tuần
     */
    @Scheduled(cron = "0 1 0 * * *", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void markOverdueBorrowRecords() {
        log.info("Bắt đầu JOB quét phiếu mượn quá hạn...");

        List<BorrowRecord> overdueRecords = borrowRecordRepository.findOverdueRecords();

        if (overdueRecords.isEmpty()) {
            log.info("Không có phiếu mượn nào quá hạn.");
            return;
        }

        for (BorrowRecord record : overdueRecords) {
            record.setStatus(BorrowStatus.OVERDUE);
        }

        borrowRecordRepository.saveAll(overdueRecords);

        // Có thể bổ sung: Sinh ra Event để EmailService gửi email cảnh báo người dùng.
        log.info("Đã đánh dấu OVERDUE cho {} phiếu mượn.", overdueRecords.size());
    }
}
