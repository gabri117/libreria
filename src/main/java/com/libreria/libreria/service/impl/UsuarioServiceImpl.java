package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.LoginRequestDTO;
import com.libreria.libreria.dto.UsuarioCreateDTO;
import com.libreria.libreria.dto.UsuarioDTO;
import com.libreria.libreria.model.Rol;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.repository.RolRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioServiceImpl(UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UsuarioDTO registrarUsuario(UsuarioCreateDTO dto) {
        Rol rol = rolRepository.findById(dto.getRolId())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado ID: " + dto.getRolId()));

        if (usuarioRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("El username '" + dto.getUsername() + "' ya está en uso.");
        }

        // ENCRIPTACIÓN AQUÍ
        String hashedPassword = passwordEncoder.encode(dto.getPassword());

        Usuario usuario = Usuario.builder()
                .rol(rol)
                .nombreCompleto(dto.getNombreCompleto())
                .username(dto.getUsername())
                .passwordHash(hashedPassword) // Guardamos el HASH, no la password plana
                .activo(true)
                .build();

        Usuario saved = usuarioRepository.save(usuario);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioDTO login(LoginRequestDTO loginRequestDTO) {
        Usuario usuario = usuarioRepository.findByUsername(loginRequestDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas")); // Mensaje genérico por seguridad

        // COMPARACIÓN DE HASH AQUÍ
        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new RuntimeException("Usuario inactivo");
        }

        return mapToDTO(usuario);
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
