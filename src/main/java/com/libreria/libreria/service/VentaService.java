package com.libreria.libreria.service;

import com.libreria.libreria.dto.VentaDTO;

import java.util.List;

public interface VentaService {
    VentaDTO crearVenta(VentaDTO ventaDTO);

    List<VentaDTO> listarVentas();
}
