package com.nhom10.library.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (!cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            log.info("Cloudinary initialized: cloud_name={}", cloudName);
        } else {
            log.warn("Cloudinary not configured — avatar upload to cloud disabled");
        }
    }

    public boolean isConfigured() {
        return cloudinary != null;
    }

    @SuppressWarnings("unchecked")
    public String uploadAvatar(MultipartFile file, String userId) throws IOException {
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "library-avatars",
                "public_id", "avatar_" + userId,
                "overwrite", true,
                "resource_type", "image",
                "transformation", "c_fill,w_300,h_300,g_face,q_auto,f_auto"
        ));
        return (String) result.get("secure_url");
    }

    @SuppressWarnings("unchecked")
    public String uploadBookCover(MultipartFile file, String bookId) throws IOException {
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "library-books",
                "public_id", "book_" + bookId,
                "overwrite", true,
                "resource_type", "image",
                "transformation", "c_fill,w_400,h_600,q_auto,f_auto"
        ));
        return (String) result.get("secure_url");
    }

    @SuppressWarnings("unchecked")
    public String uploadAuthorAvatar(MultipartFile file, String authorId) throws IOException {
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "library-authors",
                "public_id", "author_" + authorId,
                "overwrite", true,
                "resource_type", "image",
                "transformation", "c_fill,w_300,h_300,g_face,q_auto,f_auto"
        ));
        return (String) result.get("secure_url");
    }
}
