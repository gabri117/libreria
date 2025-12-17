package com.libreria.libreria.config;

import com.libreria.libreria.model.Rol;

import com.libreria.libreria.repository.RolRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(RolRepository rolRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Asegurar roles
            if (rolRepository.findByNombre("Administrador").isEmpty()) {
                rolRepository.save(Rol.builder()
                        .nombre("Administrador")
                        .descripcion("Acceso total al sistema")
                        .build());
                System.out.println("Rol Administrador creado.");
            }

            if (rolRepository.findByNombre("Vendedor").isEmpty()) {
                rolRepository.save(Rol.builder()
                        .nombre("Vendedor")
                        .descripcion("Acceso a ventas y consultas")
                        .build());
                System.out.println("Rol Vendedor creado.");
            }

            // 2. Asegurar Usuario Admin (Deshabilitado: manejar manualmente o vía script
            // SQL)
            /*
             * if (usuarioRepository.findByUsername("admin").isEmpty()) {
             * Rol adminRol = rolRepository.findByNombre("Administrador")
             * .orElseThrow(() -> new
             * RuntimeException("Error: No se encontró el rol Administrador"));
             * 
             * Usuario admin = Usuario.builder()
             * .nombreCompleto("Super Administrador")
             * .username("admin")
             * .passwordHash(passwordEncoder.encode("admin123"))
             * .rol(adminRol)
             * .activo(true)
             * .build();
             * 
             * usuarioRepository.save(admin);
             * System.out.
             * println("Usuario 'admin' creado con contraseña default 'admin123'.");
             * } else {
             * Usuario admin = usuarioRepository.findByUsername("admin").get();
             * // Verificar si la clave actual coincide con 'admin123'
             * if (!passwordEncoder.matches("admin123", admin.getPasswordHash())) {
             * admin.setPasswordHash(passwordEncoder.encode("admin123"));
             * usuarioRepository.save(admin);
             * System.out.println("Password de 'admin' corregida/reseteada a 'admin123'.");
             * }
             * }
             */
        };
    }
}
