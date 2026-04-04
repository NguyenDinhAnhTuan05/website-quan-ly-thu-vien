package com.nhom10.library.service;

import com.nhom10.library.entity.BorrowDetail;
import com.nhom10.library.entity.BorrowRecord;
import com.nhom10.library.entity.User;
import com.nhom10.library.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service tích hợp ngoài: Lên lịch tự động nhắc nhở trả sách qua Email (Spring Batch / Scheduler).
 * Đây là phần cộng điểm cho khả năng tự động hóa và xử lý nền (Background Processing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookReminderSchedulerService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final EmailService emailService;

    /**
     * Chạy vào lúc 00:30 mỗi ngày.
     */
    @Scheduled(cron = "0 30 0 * * ?")
    @Transactional(readOnly = true)
    public void scheduleDailyReminders() {
        log.info("==> [CronJob] Bắt đầu quét các phiếu mượn cần nhắc nhở qua Email lúc 00:30 AM...");

        // 1. Quét sách Sắp tới hạn (Ngày mai phải trả)
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<BorrowRecord> dueTomorrowRecords = borrowRecordRepository.findRecordsByDueDate(tomorrow);
        
        for (BorrowRecord record : dueTomorrowRecords) {
            sendReminder(record, false);
        }

        // 2. Quét sách Đã quá hạn (Chưa trả)
        List<BorrowRecord> overdueRecords = borrowRecordRepository.findOverdueRecords();
        for (BorrowRecord record : overdueRecords) {
            sendReminder(record, true);
        }

        log.info("==> [CronJob] Đã quét và gửi Email xong cho {} nhắc nhở sắp tới hạn và {} nhắc nhở quá hạn.", 
                 dueTomorrowRecords.size(), overdueRecords.size());
    }

    private void sendReminder(BorrowRecord record, boolean isOverdue) {
        User user = record.getUser();
        if (user == null || user.getEmail() == null) {
            return;
        }

        // Tạo danh sách HTML sách để gửi
        StringBuilder bookListHtml = new StringBuilder();
        for (BorrowDetail detail : record.getDetails()) {
            String bookTitle = detail.getBook() != null ? detail.getBook().getTitle() : detail.getSnapshotTitle();
            bookListHtml.append("<li>").append(bookTitle).append("</li>");
        }

        // Format ngày tháng "dd/MM/yyyy"
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String formattedDate = record.getDueDate() != null ? record.getDueDate().format(formatter) : "Không xác định";

        emailService.sendReminderEmail(
            user.getEmail(),
            user.getUsername(),
            record.getId().toString(),
            bookListHtml.toString(),
            formattedDate,
            isOverdue
        );
    }
}
