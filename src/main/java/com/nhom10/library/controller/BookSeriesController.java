package com.nhom10.library.controller;

import com.nhom10.library.dto.response.BookSeriesResponse;
import com.nhom10.library.service.BookSeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
public class BookSeriesController {

    private final BookSeriesService bookSeriesService;

    @GetMapping
    public ResponseEntity<List<BookSeriesResponse>> getAllSeries() {
        return ResponseEntity.ok(bookSeriesService.getAllSeries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookSeriesResponse> getSeriesById(@PathVariable Long id) {
        return ResponseEntity.ok(bookSeriesService.getSeriesById(id));
    }
}
