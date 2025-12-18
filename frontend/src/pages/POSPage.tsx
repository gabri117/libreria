import { useEffect, useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

import type { Producto } from '../types';
import { obtenerProductos } from '../services/productoService';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { OpeningModal } from '../components/CashControl/OpeningModal';

import { ProductCard } from '../components/ProductCard';
import { CartSidebar } from '../components/CartSidebar';

export const POSPage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const { agregarProducto } = useCart();
    const { sesionActiva, isLoading: sessionLoading, abrirSesion } = useSession();

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const data = await obtenerProductos();
            setProductos(data);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando catálogo de productos');
        } finally {
            setLoading(false);
        }
    };

    const productosFiltrados = useMemo(() => {
        if (!busqueda) return productos;
        const lower = busqueda.toLowerCase();
        return productos.filter(p =>
            p.nombre.toLowerCase().includes(lower) ||
            p.sku.toLowerCase().includes(lower)
        );
    }, [productos, busqueda]);

    const handleAgregar = (producto: Producto) => {
        agregarProducto(producto);
        toast.success(`${producto.nombre} agregado`, {
            position: 'bottom-center',
            duration: 1500,
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px'
            },
            icon: '🛒'
        });
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Toaster />

            {/* --- Main Content Area (Products) --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header / Search Bar */}
                <div className="bg-white p-6 border-b border-gray-200 shadow-sm z-10">
                    <div className="max-w-4xl mx-auto w-full">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Punto de Venta</h1>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 group-focus-within:text-brand-primary-500 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o SKU..."
                                className="
                            w-full pl-11 pr-4 py-3.5 
                            bg-gray-100 border-transparent 
                            rounded-xl text-gray-900 placeholder-gray-500 
                            focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary-500/20 focus:border-brand-primary-500
                            transition-all duration-300
                            shadow-inner
                        "
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-4 text-brand-primary-500" size={48} />
                            <p className="font-medium animate-pulse">Cargando inventario...</p>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            {productosFiltrados.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <p className="text-lg">No se encontraron productos.</p>
                                    <button
                                        onClick={() => setBusqueda('')}
                                        className="mt-2 text-brand-primary-600 hover:underline text-sm"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {productosFiltrados.map((producto) => (
                                        <ProductCard
                                            key={producto.productoId}
                                            product={producto}
                                            onAdd={handleAgregar}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- Sidebar (Cart) --- */}
            <div className="w-[400px] h-full flex-shrink-0 z-20 bg-white">
                <CartSidebar />
            </div>

            {/* Session Guard */}
            {!sessionLoading && !sesionActiva && (
                <OpeningModal onOpen={abrirSesion} />
            )}
        </div>
    );
};
