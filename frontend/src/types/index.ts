export type NivelPrecio = 'Publico' | 'Mayorista' | 'Costo';

export interface Categoria {
    categoriaId: number;
    nombre: string;
    descripcion?: string;
}

export interface Ubicacion {
    ubicacionId: number;
    nombreCorto: string;
    descripcion: string;
}

export interface Producto {
    productoId: number;
    nombre: string;
    sku: string;
    precioVenta: number;
    precioMayorista: number;
    precioCosto: number;
    cantidadStock: number;
    categoria: Categoria;
    ubicacion: Ubicacion;
    descripcion?: string;
    activo?: boolean;
}

export interface ProductoFormData {
    nombre: string;
    sku: string;
    precioVenta: number;
    precioMayorista: number;
    precioCosto: number;
    cantidadStock: number;
    categoriaId: number;
    ubicacionId: number;
    descripcion?: string;
}

export interface Cliente {
    clienteId: number; // Changed from id to clienteId to match backend
    nombreCompleto: string;
    nit?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    nivelPrecioAsignado: NivelPrecio;
    activo?: boolean;
}

export interface ClienteFormData {
    nombreCompleto: string;
    nit?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    nivelPrecioAsignado: NivelPrecio;
}

export interface DetalleVentaDTO {
    productoId: number;
    cantidad: number;
    precioUnitario?: number; // Optional as backend calculates it, but good to have
    descuento?: number;
}

export interface VentaDTO {
    ventaId?: number; // Optional because not needed for creation
    clienteId: number;
    clienteNombre?: string;
    usuarioId: number;
    usuarioNombre?: string;
    sesionId: number;
    fechaVenta?: string;
    montoTotal?: number;
    metodoPago: 'Efectivo' | 'Tarjeta' | 'Mixto';
    estado?: string;
    detalles: DetalleVentaDTO[];
}

export type EstadoSesion = 'Abierta' | 'Cerrada';

export interface SesionCaja {
    sesionId: number;
    usuarioAperturaId: number;
    fechaApertura: string;
    montoInicial: number;
    usuarioCierreId?: number;
    fechaCierre?: string;
    montoFinalEsperado?: number;
    montoFinalContado?: number;
    diferencia?: number;
    estado: EstadoSesion;
}

export interface AperturaCajaDTO {
    usuarioId: number; // For now hardcoded or from auth context later
    montoInicial: number;
}

export interface CierreCajaDTO {
    usuarioId: number;
    montoFinalContado: number;
}

export interface Proveedor {
    proveedorId: number;
    nombreEmpresa: string;
    nombreContacto?: string;
    telefono?: string;
    email?: string;
    nitProveedor?: string;
}

export interface ProveedorFormData {
    nombreEmpresa: string;
    nombreContacto?: string;
    telefono?: string;
    email?: string;
    nitProveedor?: string;
}


