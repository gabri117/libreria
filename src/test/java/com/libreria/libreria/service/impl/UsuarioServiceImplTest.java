package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.UpdateUsuarioDTO;
import com.libreria.libreria.dto.UsuarioDTO;
import com.libreria.libreria.model.Rol;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.repository.RolRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private RolRepository rolRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    @Test
    void cambiarEstado_noPermiteAutoDesactivacion() {
        Usuario admin = Usuario.builder()
                .usuarioId(1)
                .username("admin")
                .nombreCompleto("Admin")
                .rol(Rol.builder().rolId(1).nombre("Administrador").build())
                .activo(true)
                .build();

        when(usuarioRepository.findById(1)).thenReturn(Optional.of(admin));

        assertThrows(IllegalArgumentException.class, () -> usuarioService.cambiarEstado(1, false, 1));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void actualizarUsuario_actualizaDatosYPassword() {
        Rol rolVendedor = Rol.builder().rolId(2).nombre("Vendedor").build();
        Usuario usuario = Usuario.builder()
                .usuarioId(2)
                .username("vendedor1")
                .nombreCompleto("Nombre Viejo")
                .passwordHash("oldHash")
                .rol(rolVendedor)
                .activo(true)
                .build();

        when(usuarioRepository.findById(2)).thenReturn(Optional.of(usuario));
        when(rolRepository.findById(2)).thenReturn(Optional.of(rolVendedor));
        when(passwordEncoder.encode("NuevaClave123")).thenReturn("newEncodedHash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateUsuarioDTO dto = UpdateUsuarioDTO.builder()
                .nombreCompleto("Nombre Nuevo")
                .rolId(2)
                .password("NuevaClave123")
                .activo(true)
                .build();

        UsuarioDTO result = usuarioService.actualizarUsuario(2, dto, 1);

        assertEquals("Nombre Nuevo", result.getNombreCompleto());
        assertEquals("newEncodedHash", usuario.getPasswordHash());
    }
}
