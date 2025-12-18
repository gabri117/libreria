import { useEffect, useState, useMemo } from 'react';
import { Search, Loader2, ShoppingBag } from 'lucide-react';
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
        <div className="flex h-screen overflow-hidden font-sans">
            <Toaster />

            {/* --- Main Content Area (Products) --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header / Search Bar */}
                <div className="glass-panel p-6 border-b-0 shadow-xl z-20 m-4 rounded-3xl">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-1 w-6 bg-brand-primary-500 rounded-full"></span>
                            <h1 className="text-xl font-black text-white uppercase tracking-wider">Punto de Venta</h1>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="text-gray-500 group-focus-within:text-brand-primary-400 transition-colors" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar productos por nombre o SKU..."
                                className="
                                    w-full pl-12 pr-4 py-4
                                    bg-white/5 border border-white/5
                                    rounded-2xl text-white placeholder-gray-500 
                                    focus:outline-none focus:bg-white/10 focus:ring-4 focus:ring-brand-primary-500/10 focus:border-brand-primary-500/50
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
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-brand-primary-400">
                            <Loader2 className="animate-spin mb-4" size={48} strokeWidth={2.5} />
                            <p className="font-black uppercase tracking-widest text-xs animate-pulse">Consultando Inventario...</p>
                        </div>
                    ) : (
                        <div className="max-w-full mx-auto">
                            {productosFiltrados.length === 0 ? (
                                <div className="text-center py-20 text-gray-600">
                                    <ShoppingBag size={64} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-lg font-bold">No se encontraron productos.</p>
                                    <button
                                        onClick={() => setBusqueda('')}
                                        className="mt-4 px-6 py-2 glass-card text-brand-primary-400 rounded-xl font-bold hover:bg-brand-primary-500 hover:text-white transition-all"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-10">
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
            <div className="w-[420px] h-full flex-shrink-0 z-30 m-4 ml-0">
                <CartSidebar />
            </div>

            {/* Session Guard */}
            {!sessionLoading && !sesionActiva && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <OpeningModal onOpen={abrirSesion} />
                </div>
            )}
        </div>
    );
};
