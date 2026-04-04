package com.nhom10.library.repository;

import com.nhom10.library.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.book.id = :bookId")
    Page<Review> findByBookId(@Param("bookId") Long bookId, Pageable pageable);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    Optional<Review> findByUserIdAndBookId(Long userId, Long bookId);
}
