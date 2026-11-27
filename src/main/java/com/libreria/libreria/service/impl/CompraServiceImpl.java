package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.CompraDTO;
import com.libreria.libreria.dto.DetalleCompraDTO;
import com.libreria.libreria.model.*;
import com.libreria.libreria.model.enums.TipoAccion;
import com.libreria.libreria.repository.CompraRepository;
import com.libreria.libreria.repository.ProductoRepository;
import com.libreria.libreria.repository.ProveedorRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.AuditLogService;
import com.libreria.libreria.service.CompraService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompraServiceImpl implements CompraService {

    private static final Logger log = LoggerFactory.getLogger(CompraServiceImpl.class);

    private final CompraRepository compraRepository;
    private final ProveedorRepository proveedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final AuditLogService auditLogService;

    public CompraServiceImpl(
            CompraRepository compraRepository,
            ProveedorRepository proveedorRepository,
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            AuditLogService auditLogService) {
        this.compraRepository = compraRepository;
        this.proveedorRepository = proveedorRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public CompraDTO registrarCompra(CompraDTO dto, Integer usuarioId) {
        if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("La compra debe incluir al menos un producto.");
        }

        Proveedor proveedor = proveedorRepository.findById(dto.getProveedorId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado ID: " + dto.getProveedorId()));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + usuarioId));

        Compra compra = Compra.builder()
                .proveedor(proveedor)
                .usuario(usuario)
                .fechaCompra(dto.getFechaCompra() != null ? dto.getFechaCompra() : LocalDate.now())
                .numeroFacturaProveedor(dto.getNumeroFacturaProveedor())
                .detalles(new ArrayList<>())
                .build();

        BigDecimal totalCalculado = BigDecimal.ZERO;

        for (DetalleCompraDTO detDTO : dto.getDetalles()) {
            if (detDTO.getCantidad() == null || detDTO.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad de compra debe ser mayor a 0.");
            }
            if (detDTO.getPrecioCostoCompra() == null
                    || detDTO.getPrecioCostoCompra().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("El precio de costo no puede ser negativo.");
            }

            Producto producto = productoRepository.findByIdForUpdate(detDTO.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado ID: " + detDTO.getProductoId()));

            // Incrementar stock y actualizar precio de costo si es > 0
            producto.setCantidadStock(producto.getCantidadStock() + detDTO.getCantidad());
            if (detDTO.getPrecioCostoCompra().compareTo(BigDecimal.ZERO) > 0) {
                producto.setPrecioCosto(detDTO.getPrecioCostoCompra());
            }
            productoRepository.save(producto);

            DetalleCompra detalle = DetalleCompra.builder()
                    .compra(compra)
                    .producto(producto)
                    .cantidad(detDTO.getCantidad())
                    .precioCostoCompra(detDTO.getPrecioCostoCompra())
                    .build();

            compra.getDetalles().add(detalle);
            BigDecimal subtotal = detDTO.getPrecioCostoCompra().multiply(BigDecimal.valueOf(detDTO.getCantidad()));
            totalCalculado = totalCalculado.add(subtotal);
        }

        compra.setTotalCompra(totalCalculado);
        Compra saved = compraRepository.save(compra);

        try {
            String detallesAudit = String.format("Compra registrada ID %d, Proveedor: %s, Factura: %s, Total: Q%s",
                    saved.getCompraId(), proveedor.getNombreEmpresa(),
                    saved.getNumeroFacturaProveedor() != null ? saved.getNumeroFacturaProveedor() : "S/N",
                    totalCalculado);
            auditLogService.logAccion(usuarioId, TipoAccion.CREATE, "Compra", saved.getCompraId(), detallesAudit);
        } catch (Exception e) {
            log.warn("Error registrando auditoría de compra {}", saved.getCompraId(), e);
        }

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompraDTO> listarCompras() {
        return compraRepository.findAllByOrderByFechaCompraDescCompraIdDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompraDTO obtenerCompraPorId(Integer compraId) {
        Compra compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada ID: " + compraId));
        return mapToDTO(compra);
    }

    private CompraDTO mapToDTO(Compra compra) {
        List<DetalleCompraDTO> detallesDTO = compra.getDetalles().stream()
                .map(d -> DetalleCompraDTO.builder()
                        .detalleCompraId(d.getDetalleCompraId())
                        .productoId(d.getProducto().getProductoId())
                        .productoNombre(d.getProducto().getNombre())
                        .productoSku(d.getProducto().getSku())
                        .cantidad(d.getCantidad())
                        .precioCostoCompra(d.getPrecioCostoCompra())
                        .subtotal(d.getPrecioCostoCompra().multiply(BigDecimal.valueOf(d.getCantidad())))
                        .build())
                .collect(Collectors.toList());

        return CompraDTO.builder()
                .compraId(compra.getCompraId())
                .proveedorId(compra.getProveedor().getProveedorId())
                .proveedorNombre(compra.getProveedor().getNombreEmpresa())
                .usuarioId(compra.getUsuario().getUsuarioId())
                .usuarioNombre(compra.getUsuario().getNombreCompleto())
                .fechaCompra(compra.getFechaCompra())
                .numeroFacturaProveedor(compra.getNumeroFacturaProveedor())
                .totalCompra(compra.getTotalCompra())
                .detalles(detallesDTO)
                .build();
    }
}
