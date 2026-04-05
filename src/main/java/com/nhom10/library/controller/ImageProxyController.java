package com.nhom10.library.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.Base64;
import java.util.Set;

@RestController
@RequestMapping("/api/proxy")
@Slf4j
public class ImageProxyController {

    private static final Set<String> BLOCKED_HOSTS = Set.of(
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "169.254.169.254",
        "metadata.google.internal"
    );

    @GetMapping("/image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) {
        try {
            String decodedUrl = new String(Base64.getDecoder().decode(url));

            String host = URI.create(decodedUrl).getHost();
            if (host == null || BLOCKED_HOSTS.stream().anyMatch(b -> host.equalsIgnoreCase(b) || host.endsWith("." + b))) {
                log.warn("Blocked proxy request to disallowed host: {}", host);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            log.info("Proxying image from: {}", decodedUrl);

            HttpURLConnection conn = (HttpURLConnection) URI.create(decodedUrl).toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
            conn.setRequestProperty("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
            conn.setRequestProperty("Accept-Language", "en-US,en;q=0.9");
            conn.setRequestProperty("Accept-Encoding", "identity");
            conn.setRequestProperty("Referer", "https://www.goodreads.com/");
            conn.setRequestProperty("Sec-Ch-Ua", "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"");
            conn.setRequestProperty("Sec-Ch-Ua-Mobile", "?0");
            conn.setRequestProperty("Sec-Ch-Ua-Platform", "\"Windows\"");
            conn.setRequestProperty("Sec-Fetch-Dest", "image");
            conn.setRequestProperty("Sec-Fetch-Mode", "no-cors");
            conn.setRequestProperty("Sec-Fetch-Site", "cross-site");

            int status = conn.getResponseCode();
            if (status != 200) {
                log.warn("Upstream returned {} for {}", status, decodedUrl);
                conn.disconnect();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String contentType = conn.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                log.warn("Non-image content type '{}' for {}", contentType, decodedUrl);
                conn.disconnect();
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            try (InputStream is = conn.getInputStream();
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = is.read(buf)) != -1) {
                    baos.write(buf, 0, n);
                }

                HttpHeaders responseHeaders = new HttpHeaders();
                if (contentType != null) {
                    responseHeaders.set("Content-Type", contentType);
                }
                responseHeaders.setCacheControl(CacheControl.maxAge(java.time.Duration.ofDays(7)));

                return ResponseEntity.ok()
                    .headers(responseHeaders)
                    .body(baos.toByteArray());
            } finally {
                conn.disconnect();
            }

        } catch (Exception e) {
            log.error("Error proxying image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
