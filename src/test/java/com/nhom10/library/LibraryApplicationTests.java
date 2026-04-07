package com.nhom10.library;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Test tải context Spring Boot đầy đủ.
 * Yêu cầu MySQL và Redis đang chạy — bỏ qua khi test local không có DB.
 * Chạy test này trên server: mvn test -Dtest=LibraryApplicationTests
 */
@SpringBootTest
@Disabled("Yêu cầu MySQL + Redis đang chạy. Chạy trên server production.")
class LibraryApplicationTests {

    @Test
    void contextLoads() {
        // Kiểm tra toàn bộ Spring context khởi tạo thành công
    }
}
