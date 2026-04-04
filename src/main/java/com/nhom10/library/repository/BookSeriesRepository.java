package com.nhom10.library.repository;

import com.nhom10.library.entity.BookSeries;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookSeriesRepository extends JpaRepository<BookSeries, Long> {

    Optional<BookSeries> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT s FROM BookSeries s LEFT JOIN FETCH s.books WHERE s.id = :id")
    Optional<BookSeries> findByIdWithBooks(@Param("id") Long id);

    @Query("SELECT DISTINCT s FROM BookSeries s LEFT JOIN s.books b WHERE b IS NOT NULL ORDER BY s.name")
    List<BookSeries> findAllWithBooks();
}
