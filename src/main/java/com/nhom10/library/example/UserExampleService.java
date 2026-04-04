package com.nhom10.library.example;

import com.nhom10.library.entity.User;
import com.nhom10.library.entity.enums.AuthProvider;
import com.nhom10.library.entity.enums.Role;
import com.nhom10.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Exemplos de uso da Entity User com Soft Delete
 * 
 * Esta classe demonstra:
 * 1. Como criar um User
 * 2. Como buscar Users
 * 3. Como atualizar um User
 * 4. Como deletar um User (soft delete)
 * 5. Como buscar users não-deletados
 */
@Service
public class UserExampleService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ================================================================
    // 1. CRIAR UM NOVO USUÁRIO
    // ================================================================
    public User criarUsuarioLocal() {
        User user = User.builder()
            // Campos obrigatórios
            .email("joao@example.com")
            .password(passwordEncoder.encode("senha123"))  // SEMPRE hash!
            
            // Campos opcionais
            .username("joao_silva")
            .role(Role.ROLE_USER)           // Default: ROLE_USER
            .provider(AuthProvider.LOCAL)   // Default: LOCAL
            .enabled(true)                  // Default: true
            .avatarUrl("https://avatar.com/joao.jpg")
            
            // Não precisa setar:
            // - id (gerado automaticamente)
            // - createdAt (JPA Auditing preencherá)
            // - updatedAt (null até primeira atualização)
            // - deleted (default false)
            .build();

        // Salvar no banco
        return userRepository.save(user);
        // SQL gerado: INSERT INTO users (email, password, role, ...) VALUES (...)
    }

    // ================================================================
    // 2. CRIAR USUÁRIO COM OAUTH2
    // ================================================================
    public User criarUsuarioGoogle(String email, String googleId, String avatarUrl) {
        User user = User.builder()
            .email(email)
            .username(null)                           // OAuth2 não tem username local
            .password(null)                           // OAuth2 não tem password
            .role(Role.ROLE_USER)                     // Default user
            .provider(AuthProvider.GOOGLE)            // Marca como Google
            .providerId(googleId)                     // ID único do Google
            .avatarUrl(avatarUrl)
            .enabled(true)
            .build();

        return userRepository.save(user);
    }

    // ================================================================
    // 3. BUSCAR USUÁRIO POR ID (apenas não-deletados)
    // ================================================================
    public User buscarPorId(Long id) {
        // @SQLRestriction("deleted = 0") é aplicão automaticamente!
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // SQL gerado:
        // SELECT * FROM users WHERE id=? AND deleted=0
    }

    // ================================================================
    // 4. BUSCAR USUÁRIO POR EMAIL
    // ================================================================
    public User buscarPorEmail(String email) {
        // Adicione este método no UserRepository:
        // Optional<User> findByEmail(String email);
        
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Email não encontrado"));
        
        // SQL com soft-delete automático:
        // SELECT * FROM users WHERE email=? AND deleted=0
    }

    // ================================================================
    // 5. BUSCAR TODOS OS USUÁRIOS (apenas não-deletados)
    // ================================================================
    public java.util.List<User> listarTodosUsuarios() {
        return userRepository.findAll();
        
        // SQL gerado com soft-delete automático:
        // SELECT * FROM users WHERE deleted=0
    }

    // ================================================================
    // 6. ATUALIZAR INFORMAÇÕES DO USUÁRIO
    // ================================================================
    public User atualizarPerfil(Long id, String novoAvatar, String novaFoto) {
        User user = buscarPorId(id);
        user.setAvatarUrl(novoAvatar);
        
        // Salvar — updatedAt será preenchido automaticamente por JPA Auditing
        return userRepository.save(user);
        
        // SQL gerado:
        // UPDATE users SET avatar_url=?, updated_at=NOW() WHERE id=? AND deleted=0
    }

    // ================================================================
    // 7. PROMOVER USUÁRIO PARA ADMIN
    // ================================================================
    public User promoverParaAdmin(Long id) {
        User user = buscarPorId(id);
        user.setRole(Role.ROLE_ADMIN);
        return userRepository.save(user);
        
        // SQL: UPDATE users SET role='ROLE_ADMIN', updated_at=NOW() WHERE id=? AND deleted=0
    }

    // ================================================================
    // 8. BLOQUEAR/DESBLOQUEAR USUÁRIO (sem deletar)
    // ================================================================
    public User bloquearUsuario(Long id) {
        User user = buscarPorId(id);
        user.setEnabled(false);  // Bloqueia login
        return userRepository.save(user);
        // Mas o usuário ainda aparece em relatorios (não está deleted)
    }

    public User desbloquearUsuario(Long id) {
        User user = buscarPorId(id);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    // ================================================================
    // 9. SOFT DELETE — Marcar Usuário como Deletado
    // ================================================================
    public void deletarUsuario(Long id) {
        userRepository.deleteById(id);
        
        // @SQLDelete intercepta e executa:
        // UPDATE users SET deleted=1, updated_at=NOW() WHERE id=?
        
        // Resultado: Usuário não é realmente deletado, apenas marcado como deletado
        // Depois, não aparecerá em findAll(), findById(), etc.
        // (A menos que você escreva uma query customizada para incluir deletados)
    }

    // ================================================================
    // 10. BUSCAR USUÁRIOS DELETADOS (Query Customizada)
    // ================================================================
    // Para poder buscar deletados, adicione no UserRepository:
    /*
    @Query("SELECT u FROM User u WHERE u.deleted = true")
    List<User> findAllDeleted();
    
    @Query("SELECT u FROM User u WHERE u.id = ?1 (there is no filtering)")
    Optional<User> findByIdIncludingDeleted(Long id);
    */

    public java.util.List<User> listarDeletados() {
        // Adicionarei este método no UserRepository se necessário
        return null; // Implementar depois
    }

    // ================================================================
    // 11. VERIFICAR SE USUÁRIO ESTÁ DELETADO
    // ================================================================
    public boolean estaDeleted(User user) {
        return user.isDeleted();
    }

    // ================================================================
    // 12. EXEMPLO DE AUTENTICAÇÃO COM VERIFICAÇÃO
    // ================================================================
    public User autenticar(String email, String senhaFornecida) {
        User user = buscarPorEmail(email);
        
        // Validações
        if (!user.isEnabled()) {
            throw new RuntimeException("Usuário está bloqueado");
        }
        
        if (user.getPassword() == null) {
            // Usuário OAuth2
            throw new RuntimeException("Esta conta é OAuth2, use Google/GitHub");
        }
        
        if (!passwordEncoder.matches(senhaFornecida, user.getPassword())) {
            throw new RuntimeException("Senha incorreta");
        }
        
        // Note: não precisa verificar deleted=0
        // @SQLRestriction já filtra automaticamente!
        
        return user; // Usuário autenticado
    }

    // ================================================================
    // 13. ESTRUTURA DE DADOS NO BANCO
    // ================================================================
    /*
    Tabela: users
    
    id | username    | email           | password | role      | enabled | provider | provider_id | avatar_url | deleted | created_at | updated_at
    ---|-------------|-----------------|----------|-----------|---------|----------|-------------|------------|---------|------------|----------
    1  | joao_silva  | joao@ex.com     | bcrypt   | ROLE_USER | true    | LOCAL    | NULL       | NULL       | 0       | 2024-01-01 | 2024-01-02
    2  | maria_2030  | maria@ex.com    | bcrypt   | ROLE_ADMIN| true    | LOCAL    | NULL       | NULL       | 0       | 2024-01-05 | NULL
    3  | NULL        | pedro@ex.com    | NULL     | ROLE_USER | true    | GOOGLE   | 1234567890 | http://    | 1       | 2024-01-10 | 2024-01-15
    4  | NULL        | ana@ex.com      | NULL     | ROLE_USER | false   | GITHUB   | ana123     | http://    | 0       | 2024-01-12 | NULL
    
    Note:
    - Linha 3: Deletado (deleted=1), não aparecerá em findAll()
    - Linha 4: Bloqueado (enabled=false), não pode fazer login
    */
}
