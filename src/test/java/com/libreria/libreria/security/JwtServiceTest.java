package com.libreria.libreria.security;

import com.libreria.libreria.model.Rol;
import com.libreria.libreria.model.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    @Test
    void generateAndValidateToken_conClaveBase64Valida() {
        JwtService jwtService = new JwtService();
        String validBase64Key = Base64.getEncoder().encodeToString("0123456789ABCDEF0123456789ABCDEF".getBytes());
        ReflectionTestUtils.setField(jwtService, "secretKey", validBase64Key);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L);

        Usuario admin = Usuario.builder()
                .usuarioId(1)
                .username("administradorLB")
                .nombreCompleto("Super Admin")
                .rol(Rol.builder().rolId(1).nombre("Administrador").build())
                .activo(true)
                .build();

        String token = jwtService.generateToken(admin);

        assertNotNull(token);
        assertEquals("administradorLB", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, admin));
        assertTrue(admin.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR")));
    }
}
