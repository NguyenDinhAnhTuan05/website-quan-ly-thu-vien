package com.nhom10.library.repository;

import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.AuthProvider;
import com.nhom10.library.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository - Operações CRUD para Entity User.
 * 
 * Todas as queries aplicam automaticamente @SQLRestriction("deleted = 0")
 * Todas as operações delete() convertidas em UPDATE deleted=1 via @SQLDelete
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ================================================================
    // BUSCAR POR EMAIL (soft-delete automático)
    // ================================================================
    Optional<User> findByEmail(String email);

    // ================================================================
    // BUSCAR POR USERNAME (soft-delete automático)
    // ================================================================
    Optional<User> findByUsername(String username);

    // ================================================================
    // VERIFICAR DUPLICATAS AO REGISTRAR
    // ================================================================
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    // ================================================================
    // BUSCAR POR ROLE (usuários ativos de um certo role)
    // ================================================================
    List<User> findByRole(Role role);

    // ================================================================
    // BUSCAR USUÁRIOS DELETADOS (Query Customizada)
    // ================================================================
    @Query("SELECT u FROM User u WHERE u.deleted = true")
    List<User> findAllDeleted();

    // ================================================================
    // BUSCAR POR ID INCLUINDO DELETADOS (para auditoria)
    // ================================================================
    @Query("SELECT u FROM User u WHERE u.id = ?1")
    Optional<User> findByIdIncludingDeleted(Long id);

    // ================================================================
    // BUSCAR USUÁRIOS BLOQUEADOS
    // ================================================================
    @Query("SELECT u FROM User u WHERE u.enabled = false AND u.deleted = false")
    List<User> findBlockedUsers();

    // ================================================================
    // CONTAR USUÁRIOS ATIVOS
    // ================================================================
    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true AND u.deleted = false")
    long countActiveUsers();

    // ================================================================
    // BUSCAR POR PROVIDER (OAuth2)
    // ================================================================
    /**
     * Tìm user OAuth2 theo provider và providerId.
     * Dùng khi user đăng nhập lại bằng OAuth2 để cập nhật thông tin.
     */
    @Query("SELECT u FROM User u WHERE u.provider = :provider AND u.providerId = :providerId")
    Optional<User> findByProviderAndProviderId(
        @Param("provider") AuthProvider provider,
        @Param("providerId") String providerId
    );

    // ================================================================
    // BUSCAR USUÁRIOS OAUTH2 POR PROVIDER
    // ================================================================
    /**
     * Lấy danh sách toàn bộ users từ một provider cụ thể.
     */
    List<User> findByProvider(AuthProvider provider);

    // ================================================================
    // TÌM KIẾM USER THEO EMAIL HOẶC USERNAME (cho Admin)
    // ================================================================
    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchByEmailOrUsername(@Param("keyword") String keyword, Pageable pageable);
}
