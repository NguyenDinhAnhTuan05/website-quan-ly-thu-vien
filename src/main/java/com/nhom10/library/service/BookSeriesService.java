package com.nhom10.library.service;

import com.nhom10.library.dto.response.BookSeriesResponse;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.BookSeriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookSeriesService {

    private final BookSeriesRepository bookSeriesRepository;

    public List<BookSeriesResponse> getAllSeries() {
        return bookSeriesRepository.findAllWithBooks().stream()
            .map(BookSeriesResponse::from)
            .toList();
    }

    public BookSeriesResponse getSeriesById(Long id) {
        var series = bookSeriesRepository.findByIdWithBooks(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sách với id: " + id));
        return BookSeriesResponse.fromWithBooks(series);
    }
}
