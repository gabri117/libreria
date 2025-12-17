package com.libreria.libreria.service;

import com.libreria.libreria.dto.ProveedorDTO;
import java.util.List;

public interface ProveedorService {
    List<ProveedorDTO> listarTodos();

    ProveedorDTO obtenerPorId(Integer id);

    ProveedorDTO crear(ProveedorDTO dto);

    ProveedorDTO actualizar(Integer id, ProveedorDTO dto);

    void eliminar(Integer id);
}
