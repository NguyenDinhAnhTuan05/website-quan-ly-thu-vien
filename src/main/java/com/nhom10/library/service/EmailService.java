package com.nhom10.library.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Gửi email HTML bất đồng bộ (@Async) — không block thread xử lý request.
 * Cần @EnableAsync trong LibraryApplication (đã có).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Gửi email reset mật khẩu với link chứa token.
     * @Async: chạy trên thread pool riêng, không block request thread.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String token, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[Thư Viện] Yêu cầu đặt lại mật khẩu");

            // Lấy origin đầu tiên trong danh sách
            String origin = frontendUrl.split(",")[0].trim();
            String resetLink = origin + "/reset-password?token=" + token;

            String htmlContent = buildPasswordResetEmailTemplate(username, resetLink);
            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(message);
            log.info("Đã gửi email reset password đến: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Không thể gửi email đến {}: {}", toEmail, e.getMessage());
            // Không throw exception — tránh ảnh hưởng flow chính
        }
    }

    private String buildPasswordResetEmailTemplate(String username, String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6f9; padding:20px;">
              <div style="max-width:600px; margin:auto; background:#fff; border-radius:12px;
                          box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
                <div style="background:linear-gradient(135deg,#667eea,#764ba2); padding:30px; text-align:center;">
                  <h1 style="color:#fff; margin:0; font-size:24px;">📚 Thư Viện Trực Tuyến</h1>
                </div>
                <div style="padding:30px;">
                  <h2 style="color:#333;">Xin chào, %s!</h2>
                  <p style="color:#555; line-height:1.6;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                    Nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu.
                  </p>
                  <div style="text-align:center; margin:30px 0;">
                    <a href="%s"
                       style="background:linear-gradient(135deg,#667eea,#764ba2); color:#fff;
                              padding:14px 32px; border-radius:8px; text-decoration:none;
                              font-weight:bold; font-size:16px; display:inline-block;">
                      🔐 Đặt Lại Mật Khẩu
                    </a>
                  </div>
                  <p style="color:#888; font-size:14px; line-height:1.6;">
                    ⏰ Link có hiệu lực trong <strong>15 phút</strong>.<br>
                    Nếu bạn không yêu cầu reset mật khẩu, hãy bỏ qua email này.
                    Tài khoản của bạn vẫn an toàn.
                  </p>
                </div>
                <div style="background:#f8f9fa; padding:16px; text-align:center;">
                  <p style="color:#aaa; font-size:12px; margin:0;">
                    © 2026 Thư Viện Trực Tuyến · Nhóm 10
                  </p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(username, resetLink);
    }

    /**
     * Gửi Email nhắc nhở trả sách chuẩn bị tới hạn hoặc đã quá hạn.
     */
    @Async
    public void sendReminderEmail(String toEmail, String username, String borrowId, String bookList, String dueDate, boolean isOverdue) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            
            String subject = isOverdue 
                ? "⚠️ Cảnh báo: Sách mượn đã QUÁ HẠN!" 
                : "⏰ Nhắc nhở: Sách mượn sắp đến hạn trả";
            helper.setSubject(subject);

            String htmlContent = buildReminderEmailTemplate(username, borrowId, bookList, dueDate, isOverdue);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email nhắc nhở trả sách đến: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Không thể gửi email nhắc nhở đến {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildReminderEmailTemplate(String username, String borrowId, String bookList, String dueDate, boolean isOverdue) {
        String alertColor = isOverdue ? "#e53e3e" : "#d69e2e"; // Đỏ nếu trễ, cam nếu warning
        String statusText = isOverdue ? "ĐÃ QUÁ HẠN TRẢ SÁCH" : "SẮP ĐẾN HẠN TRẢ SÁCH";
        
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"></head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; background:#f4f6f9; padding:20px;">
              <div style="max-width:600px; margin:auto; background:#fff; border-radius:12px;
                          box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
                <div style="background:%s; padding:20px; text-align:center;">
                  <h1 style="color:#fff; margin:0; font-size:22px;">%s</h1>
                </div>
                <div style="padding:30px;">
                  <h2 style="color:#333;">Xin chào %s!</h2>
                  <p style="color:#555; line-height:1.6;">
                    Bạn đang có phiếu mượn sách <strong>#%s</strong> tại Thư viện. 
                    %s
                  </p>
                  <div style="background:#f7fafc; padding:15px; border-left:4px solid %s; margin:20px 0;">
                    <p style="margin:0 0 10px 0;"><strong>Hạn trả cuối cùng:</strong> <span style="color:#e53e3e; font-weight:bold;">%s</span></p>
                    <p style="margin:0;"><strong>Danh sách cuốn sách:</strong></p>
                    <ul style="margin-top:5px; color:#4a5568;">
                      %s
                    </ul>
                  </div>
                  <p style="color:#888; font-size:14px; line-height:1.6;">
                    Vui lòng sắp xếp thời gian đến thư viện để hoàn tất thủ tục trả sách.
                    Việc trả sách trễ hạn có thể bị phạt theo quy định của thư viện.<br/>
                    Trân trọng!
                  </p>
                </div>
              </div>
            </body>
            </html>
            """, alertColor, statusText, username, borrowId, 
                 isOverdue ? "Phiếu mượn này đã quá thời hạn cho phép." : "Phiếu mượn này dự kiến sẽ phải trả vào ngày mai.",
                 alertColor, dueDate, bookList);
    }
}
