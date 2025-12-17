package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.CreateUsuarioDTO;
import com.libreria.libreria.dto.LoginDTO;
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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
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

        return mapToDTO(usuarioRepository.save(usuario));
    }

    @Override
    public Optional<Usuario> login(LoginDTO loginDTO) {
        System.out.println("Intentando login para usuario: " + loginDTO.getUsername());
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(loginDTO.getUsername());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            System.out.println("Usuario encontrado en BD. Comparando contraseñas...");
            boolean matches = passwordEncoder.matches(loginDTO.getPassword(), usuario.getPasswordHash());
            System.out.println("¿Contraseña coincide?: " + matches);

            if (matches) {
                if (!usuario.getActivo()) {
                    System.out.println("Usuario inactivo");
                    throw new RuntimeException("Usuario inactivo");
                }
                return Optional.of(usuario);
            }
        } else {
            System.out.println("Usuario NO encontrado en BD");
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
