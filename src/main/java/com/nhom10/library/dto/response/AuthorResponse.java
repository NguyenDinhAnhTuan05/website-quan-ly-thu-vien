package com.nhom10.library.dto.response;

import com.nhom10.library.entity.Author;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuthorResponse {

    private Long id;
    private String name;
    private String bio;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public static AuthorResponse from(Author author) {
        return AuthorResponse.builder()
            .id(author.getId())
            .name(author.getName())
            .bio(author.getBio())
            .avatarUrl(author.getAvatarUrl())
            .createdAt(author.getCreatedAt())
            .build();
    }
}
