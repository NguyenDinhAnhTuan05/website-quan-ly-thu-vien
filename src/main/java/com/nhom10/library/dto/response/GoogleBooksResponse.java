package com.nhom10.library.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * Lớp DTO để parse kết quả trả về từ Google Books API.
 * @JsonIgnoreProperties(ignoreUnknown = true) giúp bỏ qua các field không định nghĩa thay vì báo lỗi.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleBooksResponse {

    private List<Item> items;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Item {
        private String id;
        private VolumeInfo volumeInfo;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VolumeInfo {
        private String title;
        private List<String> authors;
        private String description;
        private List<IndustryIdentifier> industryIdentifiers;
        private Integer pageCount;
        private List<String> categories;
        private ImageLinks imageLinks;
        private String publishedDate;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class IndustryIdentifier {
        private String type;
        private String identifier;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ImageLinks {
        private String smallThumbnail;
        private String thumbnail;
    }
}
