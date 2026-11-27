package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.AjusteInventarioDTO;
import com.libreria.libreria.model.AjusteInventario;
import com.libreria.libreria.model.Producto;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.repository.AjusteInventarioRepository;
import com.libreria.libreria.repository.ProductoRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AjusteInventarioServiceImplTest {

    @Mock private AjusteInventarioRepository ajusteRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private AuditLogService auditLogService;

    @InjectMocks
    private AjusteInventarioServiceImpl ajusteService;

    @Test
    void registrarAjuste_negativoValido_descuentaStock() {
        Usuario admin = Usuario.builder().usuarioId(1).nombreCompleto("Admin").username("admin").build();
        Producto producto = Producto.builder()
                .productoId(5)
                .nombre("Tijera Escolar")
                .sku("TIJ-01")
                .cantidadStock(10)
                .build();

        when(usuarioRepository.findById(1)).thenReturn(Optional.of(admin));
        when(productoRepository.findByIdForUpdate(5)).thenReturn(Optional.of(producto));
        when(ajusteRepository.save(any(AjusteInventario.class))).thenAnswer(inv -> {
            AjusteInventario a = inv.getArgument(0);
            a.setAjusteId(12);
            return a;
        });

        AjusteInventarioDTO dto = AjusteInventarioDTO.builder()
                .productoId(5)
                .cantidad(-2)
                .motivo("Producto dañado en vitrina")
                .build();

        AjusteInventarioDTO result = ajusteService.registrarAjuste(dto, 1);

        assertEquals(12, result.getAjusteId());
        assertEquals(8, producto.getCantidadStock());
        assertEquals(8, result.getStockResultante());
    }

    @Test
    void registrarAjuste_cantidadCero_lanzaExcepcion() {
        AjusteInventarioDTO dto = AjusteInventarioDTO.builder()
                .productoId(5)
                .cantidad(0)
                .motivo("Conteo")
                .build();

        assertThrows(IllegalArgumentException.class, () -> ajusteService.registrarAjuste(dto, 1));
    }

    @Test
    void registrarAjuste_dejariaStockNegativo_lanzaExcepcion() {
        Usuario admin = Usuario.builder().usuarioId(1).nombreCompleto("Admin").username("admin").build();
        Producto producto = Producto.builder()
                .productoId(5)
                .nombre("Tijera Escolar")
                .cantidadStock(2)
                .build();

        when(usuarioRepository.findById(1)).thenReturn(Optional.of(admin));
        when(productoRepository.findByIdForUpdate(5)).thenReturn(Optional.of(producto));

        AjusteInventarioDTO dto = AjusteInventarioDTO.builder()
                .productoId(5)
                .cantidad(-5)
                .motivo("Merma")
                .build();

        assertThrows(IllegalArgumentException.class, () -> ajusteService.registrarAjuste(dto, 1));
        assertEquals(2, producto.getCantidadStock());
        verify(ajusteRepository, never()).save(any());
    }
}
