package com.nhom10.library.dto.response;

import com.nhom10.library.entity.BookSeries;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BookSeriesResponse {

    private Long id;
    private String name;
    private String description;
    private String coverUrl;
    private int bookCount;
    private List<BookResponse> books;

    public static BookSeriesResponse from(BookSeries series) {
        return BookSeriesResponse.builder()
            .id(series.getId())
            .name(series.getName())
            .description(series.getDescription())
            .coverUrl(series.getCoverUrl())
            .bookCount(series.getBooks() != null ? series.getBooks().size() : 0)
            .build();
    }

    public static BookSeriesResponse fromWithBooks(BookSeries series) {
        return BookSeriesResponse.builder()
            .id(series.getId())
            .name(series.getName())
            .description(series.getDescription())
            .coverUrl(series.getCoverUrl())
            .bookCount(series.getBooks() != null ? series.getBooks().size() : 0)
            .books(series.getBooks() != null
                ? series.getBooks().stream().map(BookResponse::from).toList()
                : List.of())
            .build();
    }
}
