package com.libreria.libreria.service;

import com.libreria.libreria.dto.CompraDTO;

import java.util.List;

public interface CompraService {
    CompraDTO registrarCompra(CompraDTO dto, Integer usuarioId);

    List<CompraDTO> listarCompras();

    CompraDTO obtenerCompraPorId(Integer compraId);
}
