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

            // 2. Nota: La creación de usuarios se debe manejar manualmente o desde la
            // interfaz.
        };
    }
}
