package com.libreria.libreria.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraDTO {
    private Integer compraId;

    @NotNull(message = "El proveedor es requerido")
    private Integer proveedorId;
    private String proveedorNombre;

    private Integer usuarioId;
    private String usuarioNombre;

    private LocalDate fechaCompra;

    @Size(max = 100, message = "El número de factura no puede exceder 100 caracteres")
    private String numeroFacturaProveedor;

    private BigDecimal totalCompra;

    @NotEmpty(message = "La compra debe incluir al menos un producto")
    @Valid
    private List<DetalleCompraDTO> detalles;
}
