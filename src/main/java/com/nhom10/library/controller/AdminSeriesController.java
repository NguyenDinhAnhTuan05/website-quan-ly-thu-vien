package com.nhom10.library.controller;

import com.nhom10.library.dto.request.AdminSeriesRequest;
import com.nhom10.library.dto.response.BookSeriesResponse;
import com.nhom10.library.service.BookSeriesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/series")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminSeriesController {

    private final BookSeriesService bookSeriesService;

    @GetMapping
    public ResponseEntity<List<BookSeriesResponse>> getAllSeries() {
        return ResponseEntity.ok(bookSeriesService.getAllSeriesAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookSeriesResponse> getSeriesById(@PathVariable Long id) {
        return ResponseEntity.ok(bookSeriesService.getSeriesById(id));
    }

    @PostMapping
    public ResponseEntity<BookSeriesResponse> createSeries(@Valid @RequestBody AdminSeriesRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookSeriesService.createSeries(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookSeriesResponse> updateSeries(
            @PathVariable Long id,
            @Valid @RequestBody AdminSeriesRequest request) {
        return ResponseEntity.ok(bookSeriesService.updateSeries(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeries(@PathVariable Long id) {
        bookSeriesService.deleteSeries(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{seriesId}/books/{bookId}")
    public ResponseEntity<BookSeriesResponse> addBookToSeries(
            @PathVariable Long seriesId,
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int order) {
        return ResponseEntity.ok(bookSeriesService.addBookToSeries(seriesId, bookId, order));
    }

    @DeleteMapping("/{seriesId}/books/{bookId}")
    public ResponseEntity<BookSeriesResponse> removeBookFromSeries(
            @PathVariable Long seriesId,
            @PathVariable Long bookId) {
        return ResponseEntity.ok(bookSeriesService.removeBookFromSeries(seriesId, bookId));
    }
}
