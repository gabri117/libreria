package com.libreria.libreria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Proveedores")
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "proveedor_id")
    private Integer proveedorId;

    @NotNull
    @Size(max = 150)
    @Column(name = "nombre_empresa", nullable = false, length = 150)
    private String nombreEmpresa;

    @Size(max = 100)
    @Column(name = "nombre_contacto", length = 100)
    private String nombreContacto;

    @Size(max = 20)
    @Column(length = 20)
    private String telefono;

    @Size(max = 100)
    @Column(length = 100)
    private String email;

    @Size(max = 30)
    @Column(name = "nit_proveedor", length = 30)
    private String nitProveedor;
}
