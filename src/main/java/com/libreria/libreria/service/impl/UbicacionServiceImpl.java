package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.UbicacionDTO;
import com.libreria.libreria.model.Ubicacion;
import com.libreria.libreria.repository.UbicacionRepository;
import com.libreria.libreria.service.UbicacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UbicacionServiceImpl implements UbicacionService {

    private final UbicacionRepository ubicacionRepository;

    @Autowired
    public UbicacionServiceImpl(UbicacionRepository ubicacionRepository) {
        this.ubicacionRepository = ubicacionRepository;
    }

    @Override
    public List<UbicacionDTO> listarTodas() {
        return ubicacionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UbicacionDTO obtenerPorId(Integer id) {
        Ubicacion ubicacion = ubicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada con ID: " + id));
        return mapToDTO(ubicacion);
    }

    @Override
    @Transactional
    public UbicacionDTO crear(UbicacionDTO dto) {
        Ubicacion ubicacion = Ubicacion.builder()
                .nombreCorto(dto.getNombreCorto())
                .descripcion(dto.getDescripcion())
                .build();
        return mapToDTO(ubicacionRepository.save(ubicacion));
    }

    @Override
    @Transactional
    public UbicacionDTO actualizar(Integer id, UbicacionDTO dto) {
        Ubicacion ubicacion = ubicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ubicación no encontrada con ID: " + id));

        ubicacion.setNombreCorto(dto.getNombreCorto());
        ubicacion.setDescripcion(dto.getDescripcion());

        return mapToDTO(ubicacionRepository.save(ubicacion));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!ubicacionRepository.existsById(id)) {
            throw new RuntimeException("Ubicación no encontrada con ID: " + id);
        }
        ubicacionRepository.deleteById(id);
    }

    private UbicacionDTO mapToDTO(Ubicacion ubicacion) {
        return UbicacionDTO.builder()
                .ubicacionId(ubicacion.getUbicacionId())
                .nombreCorto(ubicacion.getNombreCorto())
                .descripcion(ubicacion.getDescripcion())
                .build();
    }
}
