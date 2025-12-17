package com.libreria.libreria.service.impl;

import com.libreria.libreria.dto.AperturaCajaDTO;
import com.libreria.libreria.dto.CierreCajaDTO;
import com.libreria.libreria.dto.SesionCajaDTO;
import com.libreria.libreria.model.SesionCaja;
import com.libreria.libreria.model.Usuario;
import com.libreria.libreria.model.enums.EstadoSesion;
import com.libreria.libreria.repository.SesionCajaRepository;
import com.libreria.libreria.repository.UsuarioRepository;
import com.libreria.libreria.service.SesionCajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class SesionCajaServiceImpl implements SesionCajaService {

        private final SesionCajaRepository sesionCajaRepository;
        private final UsuarioRepository usuarioRepository;
        private final com.libreria.libreria.repository.VentaRepository ventaRepository;

        @Autowired
        public SesionCajaServiceImpl(SesionCajaRepository sesionCajaRepository, UsuarioRepository usuarioRepository,
                        com.libreria.libreria.repository.VentaRepository ventaRepository) {
                this.sesionCajaRepository = sesionCajaRepository;
                this.usuarioRepository = usuarioRepository;
                this.ventaRepository = ventaRepository;
        }

        @Override
        public SesionCajaDTO obtenerSesionActiva(Integer usuarioId) {
                return sesionCajaRepository.findByUsuarioApertura_UsuarioIdAndEstado(usuarioId, EstadoSesion.Abierta)
                                .map(this::mapToDTO)
                                .orElse(null);
        }

        @Override
        @Transactional
        public SesionCajaDTO abrirSesion(AperturaCajaDTO dto) {
                // Verificar si ya tiene sesión abierta
                if (sesionCajaRepository
                                .findByUsuarioApertura_UsuarioIdAndEstado(dto.getUsuarioId(), EstadoSesion.Abierta)
                                .isPresent()) {
                        throw new RuntimeException("El usuario ya tiene una sesión abierta.");
                }

                Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado con ID: " + dto.getUsuarioId()));

                SesionCaja nuevaSesion = SesionCaja.builder()
                                .usuarioApertura(usuario)
                                .fechaApertura(LocalDateTime.now())
                                .montoInicial(dto.getMontoInicial())
                                .estado(EstadoSesion.Abierta)
                                .build();

                return mapToDTO(sesionCajaRepository.save(nuevaSesion));
        }

        @Override
        @Transactional
        public SesionCajaDTO cerrarSesion(Integer sesionId, CierreCajaDTO dto) {
                SesionCaja sesion = sesionCajaRepository.findById(sesionId)
                                .orElseThrow(() -> new RuntimeException("Sesión no encontrada con ID: " + sesionId));

                if (sesion.getEstado() == EstadoSesion.Cerrada) {
                        throw new RuntimeException("La sesión ya está cerrada.");
                }

                Usuario usuarioCierre = usuarioRepository.findById(dto.getUsuarioId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Usuario no encontrado con ID: " + dto.getUsuarioId()));

                // Sumar las ventas realizadas en efectivo durante la sesión
                BigDecimal ventasEfectivo = ventaRepository.findBySesion_SesionIdAndEstadoAndMetodoPago(
                                sesionId,
                                com.libreria.libreria.model.enums.EstadoVenta.Completada,
                                com.libreria.libreria.model.enums.MetodoPago.Efectivo).stream()
                                .map(com.libreria.libreria.model.Venta::getMontoTotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal montoEsperado = sesion.getMontoInicial().add(ventasEfectivo);
                BigDecimal diferencia = dto.getMontoFinalContado().subtract(montoEsperado);

                sesion.setUsuarioCierre(usuarioCierre);
                sesion.setFechaCierre(LocalDateTime.now());
                sesion.setMontoFinalEsperado(montoEsperado);
                sesion.setMontoFinalContado(dto.getMontoFinalContado());
                sesion.setDiferencia(diferencia);
                sesion.setEstado(EstadoSesion.Cerrada);

                return mapToDTO(sesionCajaRepository.save(sesion));
        }

        private SesionCajaDTO mapToDTO(SesionCaja sesion) {
                BigDecimal montoEsperado = sesion.getMontoFinalEsperado();

                // Si la sesión está abierta, calculamos el monto esperado en tiempo real para
                // mostrar al usuario
                if (sesion.getEstado() == EstadoSesion.Abierta) {
                        BigDecimal ventasEfectivo = ventaRepository.findBySesion_SesionIdAndEstadoAndMetodoPago(
                                        sesion.getSesionId(),
                                        com.libreria.libreria.model.enums.EstadoVenta.Completada,
                                        com.libreria.libreria.model.enums.MetodoPago.Efectivo).stream()
                                        .map(com.libreria.libreria.model.Venta::getMontoTotal)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                        montoEsperado = sesion.getMontoInicial().add(ventasEfectivo);
                }

                return SesionCajaDTO.builder()
                                .sesionId(sesion.getSesionId())
                                .usuarioAperturaId(sesion.getUsuarioApertura().getUsuarioId())
                                .usuarioAperturaNombre(sesion.getUsuarioApertura().getNombreCompleto())
                                .fechaApertura(sesion.getFechaApertura())
                                .montoInicial(sesion.getMontoInicial())
                                .usuarioCierreId(sesion.getUsuarioCierre() != null
                                                ? sesion.getUsuarioCierre().getUsuarioId()
                                                : null)
                                .usuarioCierreNombre(
                                                sesion.getUsuarioCierre() != null
                                                                ? sesion.getUsuarioCierre().getNombreCompleto()
                                                                : null)
                                .fechaCierre(sesion.getFechaCierre())
                                .montoFinalEsperado(montoEsperado)
                                .montoFinalContado(sesion.getMontoFinalContado())
                                .diferencia(sesion.getDiferencia())
                                .estado(sesion.getEstado())
                                .build();
        }
}
