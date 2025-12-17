package com.libreria.libreria.service;

import com.libreria.libreria.dto.CategoriaDTO;
import java.util.List;

public interface CategoriaService {
    List<CategoriaDTO> listarTodas();

    CategoriaDTO obtenerPorId(Integer id);

    CategoriaDTO crear(CategoriaDTO dto);

    CategoriaDTO actualizar(Integer id, CategoriaDTO dto);

    void eliminar(Integer id);
}
