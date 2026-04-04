package com.nhom10.library.service;

import com.nhom10.library.dto.request.CategoryRequest;
import com.nhom10.library.dto.response.CategoryResponse;
import com.nhom10.library.entity.Category;
import com.nhom10.library.exception.BadRequestException;
import com.nhom10.library.exception.ResourceNotFoundException;
import com.nhom10.library.repository.CategoryRepository;
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
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // ================================================================
    // CREATE
    // ================================================================
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Thể loại '" + request.getName() + "' đã tồn tại.");
        }
        Category category = Category.builder()
            .name(request.getName())
            .description(request.getDescription())
            .build();
        return CategoryResponse.from(categoryRepository.save(category));
    }

    // ================================================================
    // READ
    // ================================================================
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAll(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(CategoryResponse::from);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllAsList() {
        return categoryRepository.findAll().stream()
            .map(CategoryResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return CategoryResponse.from(findById(id));
    }

    // ================================================================
    // UPDATE
    // ================================================================
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findById(id);
        // Kiểm tra trùng tên (ngoại trừ chính nó)
        if (!category.getName().equals(request.getName())
                && categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Thể loại '" + request.getName() + "' đã tồn tại.");
        }
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        log.info("Cập nhật thể loại thành công: ID={}", id);
        return CategoryResponse.from(categoryRepository.save(category));
    }

    // ================================================================
    // DELETE (Soft Delete)
    // ================================================================
    @Transactional
    public void delete(Long id) {
        Category category = findById(id);
        categoryRepository.delete(category); // Trigger @SQLDelete → deleted=1
        log.info("Xóa (soft) thể loại thành công: ID={}", id);
    }

    // ================================================================
    // PRIVATE HELPER
    // ================================================================
    private Category findById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }
}
