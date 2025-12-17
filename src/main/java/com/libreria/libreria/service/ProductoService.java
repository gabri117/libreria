package com.libreria.libreria.service;

import com.libreria.libreria.dto.ProductoDTO;
import java.util.List;
import java.util.Optional;

public interface ProductoService {
    List<ProductoDTO> findAll();

    Optional<ProductoDTO> findById(Integer id);

    ProductoDTO save(ProductoDTO productoDTO);

    ProductoDTO update(Integer id, ProductoDTO productoDTO);

    void delete(Integer id);
}
