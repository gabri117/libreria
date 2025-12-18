package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.ProductoDTO;
import com.libreria.libreria.model.Categoria;
import com.libreria.libreria.model.Producto;
import com.libreria.libreria.model.Ubicacion;
import com.libreria.libreria.model.enums.TipoAccion;
import com.libreria.libreria.repository.CategoriaRepository;
import com.libreria.libreria.repository.ProductoRepository;
import com.libreria.libreria.repository.UbicacionRepository;
import com.libreria.libreria.service.AuditLogService;
import com.libreria.libreria.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;
    private final AuditLogService auditLogService;

    @Autowired
    public ProductoServiceImpl(ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository,
            UbicacionRepository ubicacionRepository,
            AuditLogService auditLogService) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.ubicacionRepository = ubicacionRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoDTO> findAll() {
        return productoRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> findById(Integer id) {
        return productoRepository.findById(id)
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public ProductoDTO save(ProductoDTO productoDTO) {
        Producto producto = mapToEntity(productoDTO);
        producto.setActivo(true);
        Producto savedProducto = productoRepository.save(producto);

        // Audit log - assuming system user ID 1 for now (should be from
        // SecurityContext)
        try {
            auditLogService.logAccion(1, TipoAccion.CREATE, "Producto", savedProducto.getProductoId(),
                    "Producto creado: " + savedProducto.getNombre());
        } catch (Exception e) {
            // Continue even if audit fails
        }

        return mapToDTO(savedProducto);
    }

    @Override
    @Transactional
    public ProductoDTO update(Integer id, ProductoDTO productoDTO) {
        return productoRepository.findById(id).map(existingProducto -> {

            existingProducto.setNombre(productoDTO.getNombre());
            existingProducto.setDescripcion(productoDTO.getDescripcion());
            existingProducto.setSku(productoDTO.getSku());
            existingProducto.setPrecioVenta(productoDTO.getPrecioVenta());
            existingProducto.setPrecioMayorista(productoDTO.getPrecioMayorista());
            existingProducto.setPrecioCosto(productoDTO.getPrecioCosto());
            existingProducto.setCantidadStock(productoDTO.getCantidadStock());

            if (productoDTO.getActivo() != null) {
                existingProducto.setActivo(productoDTO.getActivo());
            }

            // Update relations if changed
            if (!existingProducto.getCategoria().getCategoriaId().equals(productoDTO.getCategoriaId())) {
                Categoria categoria = categoriaRepository.findById(productoDTO.getCategoriaId())
                        .orElseThrow(() -> new RuntimeException(
                                "Categoria no encontrada ID: " + productoDTO.getCategoriaId()));
                existingProducto.setCategoria(categoria);
            }

            if (!existingProducto.getUbicacion().getUbicacionId().equals(productoDTO.getUbicacionId())) {
                Ubicacion ubicacion = ubicacionRepository.findById(productoDTO.getUbicacionId())
                        .orElseThrow(() -> new RuntimeException(
                                "Ubicacion no encontrada ID: " + productoDTO.getUbicacionId()));
                existingProducto.setUbicacion(ubicacion);
            }

            Producto updated = productoRepository.save(existingProducto);

            // Audit log
            try {
                String detalles = String.format("Producto actualizado: %s (ID: %d)", updated.getNombre(),
                        updated.getProductoId());
                auditLogService.logAccion(1, TipoAccion.UPDATE, "Producto", updated.getProductoId(), detalles);
            } catch (Exception e) {
                // Continue even if audit fails
            }

            return mapToDTO(updated);
        }).orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        productoRepository.findById(id).ifPresent(producto -> {
            producto.setActivo(false);
            productoRepository.save(producto);

            // Audit log
            try {
                String detalles = String.format("Producto eliminado (soft delete): %s (ID: %d)", producto.getNombre(),
                        producto.getProductoId());
                auditLogService.logAccion(1, TipoAccion.DELETE, "Producto", producto.getProductoId(), detalles);
            } catch (Exception e) {
                // Continue even if audit fails
            }
        });
    }

    // Mapping Helpers
    private ProductoDTO mapToDTO(Producto producto) {
        return ProductoDTO.builder()
                .productoId(producto.getProductoId())
                .categoriaId(producto.getCategoria().getCategoriaId())
                .categoriaNombre(producto.getCategoria().getNombre())
                .ubicacionId(producto.getUbicacion().getUbicacionId())
                .ubicacionNombre(producto.getUbicacion().getNombreCorto())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .sku(producto.getSku())
                .precioVenta(producto.getPrecioVenta())
                .precioMayorista(producto.getPrecioMayorista())
                .precioCosto(producto.getPrecioCosto())
                .cantidadStock(producto.getCantidadStock())
                .activo(producto.getActivo())
                .build();
    }

    private Producto mapToEntity(ProductoDTO dto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada ID: " + dto.getCategoriaId()));

        Ubicacion ubicacion = ubicacionRepository.findById(dto.getUbicacionId())
                .orElseThrow(() -> new RuntimeException("Ubicacion no encontrada ID: " + dto.getUbicacionId()));

        return Producto.builder()
                .productoId(dto.getProductoId())
                .categoria(categoria)
                .ubicacion(ubicacion)
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .sku(dto.getSku())
                .precioVenta(dto.getPrecioVenta())
                .precioMayorista(dto.getPrecioMayorista())
                .precioCosto(dto.getPrecioCosto())
                .cantidadStock(dto.getCantidadStock())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();
    }
}
