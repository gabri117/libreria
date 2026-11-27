package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.AjusteInventarioDTO;
import com.libreria.libreria.model.AjusteInventario;
import com.libreria.libreria.model.Producto;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.model.enums.TipoAccion;
import com.libreria.libreria.repository.AjusteInventarioRepository;
import com.libreria.libreria.repository.ProductoRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.AjusteInventarioService;
import com.libreria.libreria.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AjusteInventarioServiceImpl implements AjusteInventarioService {

    private static final Logger log = LoggerFactory.getLogger(AjusteInventarioServiceImpl.class);

    private final AjusteInventarioRepository ajusteRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditLogService auditLogService;

    public AjusteInventarioServiceImpl(
            AjusteInventarioRepository ajusteRepository,
            ProductoRepository productoRepository,
            UsuarioRepository usuarioRepository,
            AuditLogService auditLogService) {
        this.ajusteRepository = ajusteRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public AjusteInventarioDTO registrarAjuste(AjusteInventarioDTO dto, Integer usuarioId) {
        if (dto.getCantidad() == null || dto.getCantidad() == 0) {
            throw new IllegalArgumentException("La cantidad del ajuste debe ser distinta de cero.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + usuarioId));

        Producto producto = productoRepository.findByIdForUpdate(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado ID: " + dto.getProductoId()));

        int nuevoStock = producto.getCantidadStock() + dto.getCantidad();
        if (nuevoStock < 0) {
            throw new IllegalArgumentException(
                    String.format("El ajuste dejaría stock negativo para %s (Actual: %d, Ajuste: %d).",
                            producto.getNombre(), producto.getCantidadStock(), dto.getCantidad()));
        }

        producto.setCantidadStock(nuevoStock);
        productoRepository.save(producto);

        AjusteInventario ajuste = AjusteInventario.builder()
                .usuario(usuario)
                .producto(producto)
                .fechaAjuste(LocalDateTime.now())
                .cantidad(dto.getCantidad())
                .motivo(dto.getMotivo().trim())
                .build();

        AjusteInventario saved = ajusteRepository.save(ajuste);

        try {
            String detallesAudit = String.format("Ajuste inventario ID %d, Producto: %s, Cantidad: %+d, Motivo: %s",
                    saved.getAjusteId(), producto.getNombre(), dto.getCantidad(), saved.getMotivo());
            auditLogService.logAccion(usuarioId, TipoAccion.UPDATE, "AjusteInventario", saved.getAjusteId(),
                    detallesAudit);
        } catch (Exception e) {
            log.warn("Error registrando auditoría de ajuste {}", saved.getAjusteId(), e);
        }

        return mapToDTO(saved, nuevoStock);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AjusteInventarioDTO> listarAjustes() {
        return ajusteRepository.findAllByOrderByFechaAjusteDesc().stream()
                .map(a -> mapToDTO(a, a.getProducto().getCantidadStock()))
                .collect(Collectors.toList());
    }

    private AjusteInventarioDTO mapToDTO(AjusteInventario ajuste, Integer stockActual) {
        return AjusteInventarioDTO.builder()
                .ajusteId(ajuste.getAjusteId())
                .usuarioId(ajuste.getUsuario().getUsuarioId())
                .usuarioNombre(ajuste.getUsuario().getNombreCompleto())
                .productoId(ajuste.getProducto().getProductoId())
                .productoNombre(ajuste.getProducto().getNombre())
                .productoSku(ajuste.getProducto().getSku())
                .fechaAjuste(ajuste.getFechaAjuste())
                .cantidad(ajuste.getCantidad())
                .motivo(ajuste.getMotivo())
                .stockResultante(stockActual)
                .build();
    }
}
