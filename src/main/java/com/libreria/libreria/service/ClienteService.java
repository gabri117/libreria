package com.libreria.libreria.service;

import com.libreria.libreria.dto.ClienteDTO;
import java.util.List;
import java.util.Optional;

public interface ClienteService {
    List<ClienteDTO> findAll();

    Optional<ClienteDTO> findById(Integer id);

    ClienteDTO save(ClienteDTO clienteDTO);

    ClienteDTO update(Integer id, ClienteDTO clienteDTO);

    void delete(Integer id);
}
