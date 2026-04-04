package com.nhom10.library.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình tham số Cổng Thanh Toán kiểm tra biến động số dư SePay.
 * Hệ thống Ngân hàng mở tự động bắt tin nhắn và thông báo bằng API.
 */
@Configuration
@Getter
public class SePayConfig {

    // API Token thật sự từ hệ thống SePay của Chủ tài khoản
    @Value("${sepay.api-token:XJD8ZPEICRCFOWN70DBYMJOHUEJ6CSLSF4STWU7FIQOWLZNQTUBKDOSCBGTKXARI}")
    private String apiToken;

    // Số tài khoản và thông tin người thụ hưởng do bạn cung cấp
    @Value("${sepay.account-number:0398702156}")
    private String accountNumber;
    
    @Value("${sepay.account-name:NGUYEN DINH ANH TUAN}")
    private String accountName;
    
    @Value("${sepay.bank-name:MBBank}")
    private String bankName;
}
