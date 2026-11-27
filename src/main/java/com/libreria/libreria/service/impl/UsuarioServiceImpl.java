package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.CreateUsuarioDTO;
import com.libreria.libreria.dto.LoginDTO;
import com.libreria.libreria.dto.UpdateUsuarioDTO;
import com.libreria.libreria.dto.UsuarioDTO;
import com.libreria.libreria.model.Rol;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.model.enums.TipoAccion;
import com.libreria.libreria.repository.RolRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.AuditLogService;
import com.libreria.libreria.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioServiceImpl.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Autowired
    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Override
    public List<UsuarioDTO> obtenerUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UsuarioDTO obtenerUsuarioPorId(Integer id) {
        return usuarioRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    @Transactional
    public UsuarioDTO crearUsuario(CreateUsuarioDTO dto) {
        if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }

        Rol rol = rolRepository.findById(dto.getRolId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        Usuario usuario = Usuario.builder()
                .nombreCompleto(dto.getNombreCompleto())
                .username(dto.getUsername())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .rol(rol)
                .activo(true)
                .build();

        Usuario savedUsuario = usuarioRepository.save(usuario);

        // Audit log
        try {
            auditLogService.logAccion(savedUsuario.getUsuarioId(), TipoAccion.CREATE, "Usuario",
                    savedUsuario.getUsuarioId(),
                    "Usuario creado: " + savedUsuario.getUsername());
        } catch (Exception e) {
            // Continue even if audit fails
        }

        return mapToDTO(savedUsuario);
    }

    @Override
    @Transactional
    public UsuarioDTO actualizarUsuario(Integer id, UpdateUsuarioDTO dto, Integer adminId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + id));

        Rol rol = rolRepository.findById(dto.getRolId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setRol(rol);

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getActivo() != null) {
            if (!dto.getActivo() && usuario.getUsuarioId().equals(adminId)) {
                throw new IllegalArgumentException("No puedes desactivar tu propia cuenta.");
            }
            usuario.setActivo(dto.getActivo());
        }

        Usuario saved = usuarioRepository.save(usuario);
        try {
            auditLogService.logAccion(adminId, TipoAccion.UPDATE, "Usuario", saved.getUsuarioId(),
                    "Usuario actualizado: " + saved.getUsername());
        } catch (Exception e) {
            log.warn("Error registrando auditoría de actualización de usuario {}", saved.getUsuarioId(), e);
        }
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public UsuarioDTO cambiarEstado(Integer id, boolean activo, Integer adminId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + id));

        if (!activo && usuario.getUsuarioId().equals(adminId)) {
            throw new IllegalArgumentException("No puedes desactivar tu propia cuenta.");
        }

        usuario.setActivo(activo);
        Usuario saved = usuarioRepository.save(usuario);
        try {
            auditLogService.logAccion(adminId, TipoAccion.UPDATE, "Usuario", saved.getUsuarioId(),
                    "Estado de usuario " + saved.getUsername() + " cambiado a: " + (activo ? "Activo" : "Inactivo"));
        } catch (Exception e) {
            log.warn("Error registrando auditoría de estado de usuario {}", saved.getUsuarioId(), e);
        }
        return mapToDTO(saved);
    }

    @Override
    public Optional<Usuario> login(LoginDTO loginDTO) {
        log.info("Intentando login para usuario: {}", loginDTO.getUsername());
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(loginDTO.getUsername());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            boolean matches = passwordEncoder.matches(loginDTO.getPassword(), usuario.getPasswordHash());

            if (matches) {
                if (!usuario.getActivo()) {
                    log.warn("Intento de login con usuario inactivo: {}", loginDTO.getUsername());
                    throw new RuntimeException("Usuario inactivo");
                }

                try {
                    auditLogService.logAccion(usuario.getUsuarioId(), TipoAccion.LOGIN, "Usuario",
                            usuario.getUsuarioId(),
                            "Login exitoso: " + usuario.getUsername());
                } catch (Exception e) {
                    log.warn("Error registrando auditoría de login para {}", usuario.getUsername(), e);
                }

                return Optional.of(usuario);
            }
        }
        return Optional.empty();
    }

    private UsuarioDTO mapToDTO(Usuario usuario) {
        return UsuarioDTO.builder()
                .usuarioId(usuario.getUsuarioId())
                .rolId(usuario.getRol().getRolId())
                .rolNombre(usuario.getRol().getNombre())
                .nombreCompleto(usuario.getNombreCompleto())
                .username(usuario.getUsername())
                .activo(usuario.getActivo())
                .build();
    }
}
