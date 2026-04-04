package com.nhom10.library.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nhom10.library.entity.Book;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookResponse {

    private Long id;
    private String title;
    private String isbn;
    private String description;
    private String coverUrl;
    private String ebookUrl;
    private String previewUrl;
    private String content;
    private int quantity;
    private int availableQuantity;
    private boolean available;
    private LocalDate publishedDate;

    // Series info
    private Long seriesId;
    private String seriesName;
    private int seriesOrder;

    // Summary info — không trả full Author/Category để tránh over-fetching
    private Set<String> categoryNames;
    private Set<String> authorNames;

    /** Factory method — ánh xạ từ Entity sang DTO */
    public static BookResponse from(Book book) {
        return BookResponse.builder()
            .id(book.getId())
            .title(book.getTitle())
            .isbn(book.getIsbn())
            .description(book.getDescription())
            .coverUrl(book.getCoverUrl())
            .ebookUrl(book.getEbookUrl())
            .previewUrl(book.getPreviewUrl())
            .content(book.getContent())
            .quantity(book.getQuantity())
            .availableQuantity(book.getAvailableQuantity())
            .available(book.isAvailable())
            .publishedDate(book.getPublishedDate())
            .seriesId(book.getSeries() != null ? book.getSeries().getId() : null)
            .seriesName(book.getSeries() != null ? book.getSeries().getName() : null)
            .seriesOrder(book.getSeriesOrder())
            .categoryNames(buildCategoryNames(book))
            .authorNames(book.getAuthors().stream()
                .map(a -> a.getName()).collect(Collectors.toSet()))
            .build();
    }

    /**
     * Factory method PUBLIC — không trả content/ebookUrl (người dùng chưa xác thực).
     * Dùng cho GET /api/books/{id} (permitAll).
     */
    public static BookResponse fromPublic(Book book) {
        return BookResponse.builder()
            .id(book.getId())
            .title(book.getTitle())
            .isbn(book.getIsbn())
            .description(book.getDescription())
            .coverUrl(book.getCoverUrl())
            .previewUrl(book.getPreviewUrl())
            // content & ebookUrl bị ẩn → yêu cầu subscription để đọc
            .quantity(book.getQuantity())
            .availableQuantity(book.getAvailableQuantity())
            .available(book.isAvailable())
            .publishedDate(book.getPublishedDate())
            .seriesId(book.getSeries() != null ? book.getSeries().getId() : null)
            .seriesName(book.getSeries() != null ? book.getSeries().getName() : null)
            .seriesOrder(book.getSeriesOrder())
            .categoryNames(buildCategoryNames(book))
            .authorNames(book.getAuthors().stream()
                .map(a -> a.getName()).collect(Collectors.toSet()))
            .build();
    }

    /**
     * Xây dựng danh sách tên thể loại, bao gồm cả placeholder cho thể loại đã bị xóa.
     *
     * @SQLRestriction trên Category lọc ra các thể loại deleted=1 khỏi collection.
     * @Formula deletedCategoryCount đếm số liên kết đến thể loại đã xóa.
     * Nếu có, thêm placeholder "Đã xóa" vào danh sách hiển thị.
     */
    private static Set<String> buildCategoryNames(Book book) {
        Set<String> names = book.getCategories().stream()
            .map(c -> c.getName())
            .collect(Collectors.toCollection(LinkedHashSet::new));

        if (book.getDeletedCategoryCount() > 0) {
            names.add("Đã xóa");
        }
        return names;
    }
}
