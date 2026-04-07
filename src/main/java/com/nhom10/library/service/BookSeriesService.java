package com.nhom10.library.service;

import com.nhom10.library.dto.request.AdminSeriesRequest;
import com.nhom10.library.dto.response.BookSeriesResponse;
import com.nhom10.library.entity.Book;
import com.nhom10.library.entity.BookSeries;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.BookRepository;
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
    private final BookRepository bookRepository;

    public List<BookSeriesResponse> getAllSeries() {
        return bookSeriesRepository.findAllWithBooks().stream()
            .map(BookSeriesResponse::from)
            .toList();
    }

    public List<BookSeriesResponse> getAllSeriesAdmin() {
        return bookSeriesRepository.findAllWithBooksIncludingEmpty().stream()
            .map(BookSeriesResponse::from)
            .toList();
    }

    public BookSeriesResponse getSeriesById(Long id) {
        var series = bookSeriesRepository.findByIdWithBooks(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sách với id: " + id));
        return BookSeriesResponse.fromWithBooks(series);
    }

    @Transactional
    public BookSeriesResponse createSeries(AdminSeriesRequest request) {
        if (bookSeriesRepository.existsByName(request.getName())) {
            throw new BadRequestException("Bộ sách '" + request.getName() + "' đã tồn tại.");
        }
        BookSeries series = BookSeries.builder()
            .name(request.getName())
            .description(request.getDescription())
            .coverUrl(request.getCoverUrl())
            .build();
        BookSeries saved = bookSeriesRepository.save(series);
        return BookSeriesResponse.from(saved);
    }

    @Transactional
    public BookSeriesResponse updateSeries(Long id, AdminSeriesRequest request) {
        BookSeries series = bookSeriesRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sách với id: " + id));

        if (!series.getName().equals(request.getName()) && bookSeriesRepository.existsByName(request.getName())) {
            throw new BadRequestException("Bộ sách '" + request.getName() + "' đã tồn tại.");
        }
        series.setName(request.getName());
        series.setDescription(request.getDescription());
        series.setCoverUrl(request.getCoverUrl());
        BookSeries saved = bookSeriesRepository.save(series);
        return BookSeriesResponse.from(saved);
    }

    @Transactional
    public void deleteSeries(Long id) {
        BookSeries series = bookSeriesRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sách với id: " + id));
        // Remove series reference from all books in this series
        List<Book> books = bookRepository.findBySeriesId(id);
        for (Book book : books) {
            book.setSeries(null);
            book.setSeriesOrder(0);
        }
        bookRepository.saveAll(books);
        bookSeriesRepository.delete(series);
    }

    @Transactional
    public BookSeriesResponse addBookToSeries(Long seriesId, Long bookId, int order) {
        BookSeries series = bookSeriesRepository.findByIdWithBooks(seriesId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sách với id: " + seriesId));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sách với id: " + bookId));
        book.setSeries(series);
        book.setSeriesOrder(order);
        bookRepository.save(book);
        return BookSeriesResponse.fromWithBooks(
            bookSeriesRepository.findByIdWithBooks(seriesId).orElseThrow());
    }

    @Transactional
    public BookSeriesResponse removeBookFromSeries(Long seriesId, Long bookId) {
        bookSeriesRepository.findById(seriesId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ sách với id: " + seriesId));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sách với id: " + bookId));
        book.setSeries(null);
        book.setSeriesOrder(0);
        bookRepository.save(book);
        return BookSeriesResponse.fromWithBooks(
            bookSeriesRepository.findByIdWithBooks(seriesId).orElseThrow());
    }
}
