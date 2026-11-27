import { createContext, useContext, useState, type ReactNode, useMemo } from 'react';
import type { Producto, Cliente } from '../types';

export interface CartItem extends Producto {
    cantidad: number;
    precioAplicado: number; // El precio que se está cobrando (Venta, Mayorista o Costo)
    descuento: number;
    subtotal: number;
}

interface CartContextType {
    items: CartItem[];
    clienteSeleccionado: Cliente | null;
    subtotalBruto: number;
    totalDescuento: number;
    totalVenta: number;
    agregarProducto: (producto: Producto) => boolean;
    eliminarProducto: (id: number) => void;
    actualizarCantidad: (id: number, cantidad: number) => void;
    actualizarDescuento: (id: number, descuento: number) => void;
    seleccionarCliente: (cliente: Cliente | null) => void;
    limpiarCarrito: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calcularDescuentoValido = (precio: number, cantidad: number, descuento: number): number => {
    const bruto = precio * cantidad;
    if (!Number.isFinite(descuento) || descuento < 0) return 0;
    return Math.min(descuento, bruto);
};

const calcularSubtotal = (precio: number, cantidad: number, descuento: number): number => {
    const bruto = precio * cantidad;
    const desc = calcularDescuentoValido(precio, cantidad, descuento);
    return Number((bruto - desc).toFixed(2));
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [clienteSeleccionado, setCliente] = useState<Cliente | null>(null);

    const getPrecioCorrecto = (producto: Producto, cliente: Cliente | null): number => {
        if (cliente?.nivelPrecioAsignado === 'Mayorista') {
            return producto.precioMayorista;
        }
        if (cliente?.nivelPrecioAsignado === 'Costo') {
            return producto.precioCosto;
        }
        return producto.precioVenta;
    };

    const agregarProducto = (producto: Producto): boolean => {
        if (producto.cantidadStock <= 0) {
            return false;
        }
        const existingItem = items.find((item) => item.productoId === producto.productoId);
        if (existingItem && existingItem.cantidad >= producto.cantidadStock) {
            return false;
        }

        setItems((prevItems) => {
            const existing = prevItems.find((item) => item.productoId === producto.productoId);
            const precio = getPrecioCorrecto(producto, clienteSeleccionado);

            if (existing) {
                const nuevaCantidad = Math.min(existing.cantidad + 1, producto.cantidadStock);
                const descuentoValido = calcularDescuentoValido(precio, nuevaCantidad, existing.descuento);
                return prevItems.map((item) =>
                    item.productoId === producto.productoId
                        ? {
                            ...item,
                            cantidadStock: producto.cantidadStock,
                            cantidad: nuevaCantidad,
                            precioAplicado: precio,
                            descuento: descuentoValido,
                            subtotal: calcularSubtotal(precio, nuevaCantidad, descuentoValido),
                        }
                        : item
                );
            }

            return [
                ...prevItems,
                {
                    ...producto,
                    cantidad: 1,
                    precioAplicado: precio,
                    descuento: 0,
                    subtotal: precio,
                },
            ];
        });
        return true;
    };

    const eliminarProducto = (id: number) => {
        setItems((prev) => prev.filter((item) => item.productoId !== id));
    };

    const actualizarCantidad = (id: number, cantidad: number) => {
        if (cantidad <= 0) {
            eliminarProducto(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => {
                if (item.productoId !== id) return item;
                const cantidadValida = Math.min(cantidad, item.cantidadStock);
                const descuentoValido = calcularDescuentoValido(item.precioAplicado, cantidadValida, item.descuento);
                return {
                    ...item,
                    cantidad: cantidadValida,
                    descuento: descuentoValido,
                    subtotal: calcularSubtotal(item.precioAplicado, cantidadValida, descuentoValido),
                };
            })
        );
    };

    const actualizarDescuento = (id: number, descuento: number) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.productoId !== id) return item;
                const descuentoValido = calcularDescuentoValido(item.precioAplicado, item.cantidad, descuento);
                return {
                    ...item,
                    descuento: descuentoValido,
                    subtotal: calcularSubtotal(item.precioAplicado, item.cantidad, descuentoValido),
                };
            })
        );
    };

    const seleccionarCliente = (cliente: Cliente | null) => {
        setCliente(cliente);
        setItems((prevItems) =>
            prevItems.map((item) => {
                const nuevoPrecio = getPrecioCorrecto(item, cliente);
                const descuentoValido = calcularDescuentoValido(nuevoPrecio, item.cantidad, item.descuento);
                return {
                    ...item,
                    precioAplicado: nuevoPrecio,
                    descuento: descuentoValido,
                    subtotal: calcularSubtotal(nuevoPrecio, item.cantidad, descuentoValido),
                };
            })
        );
    };

    const limpiarCarrito = () => {
        setItems([]);
        setCliente(null);
    };

    const subtotalBruto = useMemo(
        () => items.reduce((acc, item) => acc + item.precioAplicado * item.cantidad, 0),
        [items]
    );

    const totalDescuento = useMemo(
        () => items.reduce((acc, item) => acc + item.descuento, 0),
        [items]
    );

    const totalVenta = useMemo(
        () => items.reduce((acc, item) => acc + item.subtotal, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                clienteSeleccionado,
                subtotalBruto,
                totalDescuento,
                totalVenta,
                agregarProducto,
                eliminarProducto,
                actualizarCantidad,
                actualizarDescuento,
                seleccionarCliente,
                limpiarCarrito,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};
