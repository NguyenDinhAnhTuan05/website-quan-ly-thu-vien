package com.nhom10.library.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Cache dùng ConcurrentMapCacheManager (in-memory).
 * Không cần Redis — phù hợp môi trường dev local.
 * Khi deploy production với Redis, thay bằng RedisCacheManager.
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
            "books",
            "popular-books",
            "categories",
            "authors"
        );
    }
}

