package com.nhom10.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching   // Kích hoạt Spring Cache (Redis)
@EnableAsync     // Kích hoạt async — dùng cho gửi email không đồng bộ
@EnableScheduling // Kích hoạt @Scheduled cho Cron Job (Crawler)
public class LibraryApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibraryApplication.class, args);
    }
}
