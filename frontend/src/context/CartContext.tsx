import { createContext, useContext, useState, type ReactNode, useMemo } from 'react';
import type { Producto, Cliente } from '../types';

export interface CartItem extends Producto {
    cantidad: number;
    precioAplicado: number; // El precio que se está cobrando (Venta o Mayorista)
    subtotal: number;
}

interface CartContextType {
    items: CartItem[];
    clienteSeleccionado: Cliente | null;
    totalVenta: number;
    agregarProducto: (producto: Producto) => void;
    eliminarProducto: (id: number) => void;
    actualizarCantidad: (id: number, cantidad: number) => void;
    seleccionarCliente: (cliente: Cliente | null) => void;
    limpiarCarrito: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [clienteSeleccionado, setCliente] = useState<Cliente | null>(null);

    // Calcular el precio correcto según el cliente actual
    const getPrecioCorrecto = (producto: Producto, cliente: Cliente | null): number => {
        if (cliente?.nivelPrecioAsignado === 'Mayorista') {
            return producto.precioMayorista;
        }
        if (cliente?.nivelPrecioAsignado === 'Costo') {
            return producto.precioCosto;
        }
        return producto.precioVenta;
    };

    const agregarProducto = (producto: Producto) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.productoId === producto.productoId);
            const precio = getPrecioCorrecto(producto, clienteSeleccionado);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.productoId === producto.productoId
                        ? {
                            ...item,
                            cantidad: item.cantidad + 1,
                            precioAplicado: precio, // Se reafirma el precio por si acaso
                            subtotal: (item.cantidad + 1) * precio,
                        }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        ...producto,
                        cantidad: 1,
                        precioAplicado: precio,
                        subtotal: precio,
                    },
                ];
            }
        });
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
            prev.map((item) =>
                item.productoId === id
                    ? { ...item, cantidad, subtotal: item.precioAplicado * cantidad }
                    : item
            )
        );
    };

    const seleccionarCliente = (cliente: Cliente | null) => {
        setCliente(cliente);
        // Recalcular precios de todos los items en el carrito
        setItems((prevItems) =>
            prevItems.map((item) => {
                const nuevoPrecio = getPrecioCorrecto(item, cliente);
                return {
                    ...item,
                    precioAplicado: nuevoPrecio,
                    subtotal: item.cantidad * nuevoPrecio,
                };
            })
        );
    };

    const limpiarCarrito = () => {
        setItems([]);
        setCliente(null);
    };

    const totalVenta = useMemo(() => {
        return items.reduce((acc, item) => acc + item.subtotal, 0);
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                clienteSeleccionado,
                totalVenta,
                agregarProducto,
                eliminarProducto,
                actualizarCantidad,
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
