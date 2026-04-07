package com.nhom10.library.controller;

import com.nhom10.library.security.UserPrincipal;
import com.nhom10.library.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * Controller xử lý upload file (avatar, images, etc.)
 * Ưu tiên Cloudinary nếu đã cấu hình, fallback về local.
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
            }

            // Check file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được vượt quá 5MB"));
            }

            // Check file extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên file không hợp lệ"));
            }

            String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            boolean isAllowed = false;
            for (String ext : ALLOWED_EXTENSIONS) {
                if (extension.equals(ext)) {
                    isAllowed = true;
                    break;
                }
            }

            if (!isAllowed) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)"));
            }

            // Upload lên Cloudinary nếu đã cấu hình
            if (cloudinaryService.isConfigured()) {
                String cloudUrl = cloudinaryService.uploadAvatar(file, principal.getId().toString());
                return ResponseEntity.ok(Map.of(
                    "url", cloudUrl,
                    "message", "Upload thành công"
                ));
            }

            // Fallback: lưu local
            Path uploadPath = Paths.get(uploadDir, "avatars");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/avatars/" + filename;
            
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", filename,
                "message", "Upload thành công"
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/book-cover")
    public ResponseEntity<?> uploadBookCover(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "bookId", defaultValue = "new") String bookId) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được vượt quá 5MB"));
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên file không hợp lệ"));
            }

            String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            boolean isAllowed = false;
            for (String ext : ALLOWED_EXTENSIONS) {
                if (extension.equals(ext)) {
                    isAllowed = true;
                    break;
                }
            }

            if (!isAllowed) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)"));
            }

            // Upload lên Cloudinary nếu đã cấu hình
            if (cloudinaryService.isConfigured()) {
                String cloudUrl = cloudinaryService.uploadBookCover(file, bookId);
                return ResponseEntity.ok(Map.of(
                    "url", cloudUrl,
                    "message", "Upload thành công"
                ));
            }

            // Fallback: lưu local
            Path uploadPath = Paths.get(uploadDir, "books");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/books/" + filename;
            
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "message", "Upload thành công"
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/author-avatar")
    public ResponseEntity<?> uploadAuthorAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "authorId", defaultValue = "new") String authorId) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được để trống"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("error", "File không được vượt quá 5MB"));
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên file không hợp lệ"));
            }

            String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            boolean isAllowed = false;
            for (String ext : ALLOWED_EXTENSIONS) {
                if (extension.equals(ext)) {
                    isAllowed = true;
                    break;
                }
            }

            if (!isAllowed) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)"));
            }

            if (cloudinaryService.isConfigured()) {
                String cloudUrl = cloudinaryService.uploadAuthorAvatar(file, authorId);
                return ResponseEntity.ok(Map.of(
                    "url", cloudUrl,
                    "message", "Upload thành công"
                ));
            }

            Path uploadPath = Paths.get(uploadDir, "authors");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/authors/" + filename;
            
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "message", "Upload thành công"
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi khi upload file: " + e.getMessage()));
        }
    }
}
