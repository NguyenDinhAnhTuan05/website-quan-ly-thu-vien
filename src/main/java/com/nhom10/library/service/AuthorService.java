package com.nhom10.library.service;

import com.nhom10.library.dto.request.AuthorRequest;
import com.nhom10.library.dto.response.AuthorResponse;
import com.nhom10.library.entity.Author;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorService {

    private final AuthorRepository authorRepository;

    // ================================================================
    // CREATE
    // ================================================================
    @Transactional
    public AuthorResponse create(AuthorRequest request) {
        Author author = Author.builder()
            .name(request.getName())
            .bio(request.getBio())
            .avatarUrl(request.getAvatarUrl())
            .build();
        return AuthorResponse.from(authorRepository.save(author));
    }

    // ================================================================
    // READ
    // ================================================================
    @Transactional(readOnly = true)
    public Page<AuthorResponse> getAll(Pageable pageable) {
        return authorRepository.findAll(pageable).map(AuthorResponse::from);
    }

    @Transactional(readOnly = true)
    public List<AuthorResponse> getAllAsList() {
        return authorRepository.findAll().stream()
            .map(AuthorResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public AuthorResponse getById(Long id) {
        return AuthorResponse.from(findById(id));
    }

    // ================================================================
    // UPDATE
    // ================================================================
    @Transactional
    public AuthorResponse update(Long id, AuthorRequest request) {
        Author author = findById(id);
        author.setName(request.getName());
        author.setBio(request.getBio());
        author.setAvatarUrl(request.getAvatarUrl());
        log.info("Cập nhật tác giả thành công: ID={}", id);
        return AuthorResponse.from(authorRepository.save(author));
    }

    // ================================================================
    // DELETE (Soft Delete)
    // ================================================================
    @Transactional
    public void delete(Long id) {
        Author author = findById(id);
        authorRepository.delete(author); // Trigger @SQLDelete → deleted=1
        log.info("Xóa (soft) tác giả thành công: ID={}", id);
    }

    // ================================================================
    // PRIVATE HELPER
    // ================================================================
    private Author findById(Long id) {
        return authorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Author", "id", id));
    }
}
