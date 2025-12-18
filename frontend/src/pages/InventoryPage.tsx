import { useState, useEffect } from 'react';
import { Plus, Package, RefreshCw, Search, AlertTriangle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';
import {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerCategorias,
    obtenerUbicaciones
} from '../services/productoService';
import type { Producto, ProductoFormData, Categoria, Ubicacion } from '../types';

export default function InventoryPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Filtrar productos por búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProductos(productos);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = productos.filter(
                (p) =>
                    p.nombre.toLowerCase().includes(term) ||
                    p.sku.toLowerCase().includes(term) ||
                    p.categoria.nombre.toLowerCase().includes(term)
            );
            setFilteredProductos(filtered);
        }
    }, [searchTerm, productos]);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [productosData, categoriasData, ubicacionesData] = await Promise.all([
                obtenerProductos(),
                obtenerCategorias(),
                obtenerUbicaciones()
            ]);
            setProductos(productosData);
            setCategorias(categoriasData);
            setUbicaciones(ubicacionesData);
            toast.success('Datos cargados correctamente');
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNuevoProducto = () => {
        setSelectedProducto(null);
        setIsModalOpen(true);
    };

    const handleEditarProducto = (producto: Producto) => {
        setSelectedProducto(producto);
        setIsModalOpen(true);
    };

    const handleGuardarProducto = async (formData: ProductoFormData) => {
        try {
            if (selectedProducto) {
                // Editar producto existente
                await actualizarProducto(selectedProducto.productoId, formData);
                toast.success('Producto actualizado correctamente');
            } else {
                // Crear nuevo producto
                await crearProducto(formData);
                toast.success('Producto creado correctamente');
            }
            await cargarDatos();
            setIsModalOpen(false);
            setSelectedProducto(null);
        } catch (error: any) {
            console.error('Error al guardar producto:', error);
            const errorMessage = error.response?.data?.message || 'Error al guardar el producto';
            toast.error(errorMessage);
            throw error; // Re-throw para que el modal maneje el estado de carga
        }
    };

    const handleEliminarProducto = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }

        try {
            await eliminarProducto(id);
            toast.success('Producto eliminado correctamente');
            await cargarDatos();
        } catch (error: any) {
            console.error('Error al eliminar producto:', error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el producto';
            toast.error(errorMessage);
        }
    };

    const handleCerrarModal = () => {
        setIsModalOpen(false);
        setSelectedProducto(null);
    };

    const productosConStockBajo = productos.filter((p) => p.cantidadStock < 5).length;
    const valorTotalInventario = productos.reduce(
        (sum, p) => sum + p.precioVenta * p.cantidadStock,
        0
    );

    return (
        <div className="min-h-screen font-sans">
            <div className="max-w-full mx-auto p-4 sm:p-8">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Inventario General</h1>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-11">Control de Existencias y Almacén</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-4 hidden lg:block">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Última Sincronización</span>
                            <span className="text-xs font-bold text-brand-primary-400">Hace unos momentos</span>
                        </div>
                        <button
                            onClick={handleNuevoProducto}
                            className="bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-brand-primary-600/20 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs border border-brand-primary-400/20"
                        >
                            <Plus size={20} strokeWidth={3} /> Nuevo Producto
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-slide-up">
                    {/* Total Products */}
                    <div className="glass-panel p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary-500/5 blur-3xl rounded-full group-hover:bg-brand-primary-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Total Productos</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter leading-none">{productos.length}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Items</span>
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded-2xl border-white/5 text-brand-primary-400">
                                <Package size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="glass-panel p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 blur-3xl rounded-full group-hover:bg-red-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Stock Crítico</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-red-500 tracking-tighter leading-none">{productosConStockBajo}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Alertas</span>
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded-2xl border-white/5 text-red-400">
                                <AlertTriangle size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Inventory Value */}
                    <div className="glass-panel p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-secondary-500/5 blur-3xl rounded-full group-hover:bg-brand-secondary-500/10 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Valor Invertido</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-brand-secondary-400">Q</span>
                                    <span className="text-3xl font-black text-white tracking-tighter leading-none">
                                        {valorTotalInventario.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded-2xl border-white/5 text-brand-secondary-400">
                                <DollarSign size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions & Search */}
                <div className="glass-panel p-6 border-white/5 rounded-3xl mb-10 flex flex-col lg:flex-row gap-6 animate-fade-in delay-100">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Filtrar por nombre, SKU, marca o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                        />
                    </div>

                    <button
                        onClick={cargarDatos}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 px-8 py-4 glass-card border-white/5 text-gray-400 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={16} strokeWidth={3} className={isLoading ? 'animate-spin text-brand-primary-500' : ''} />
                        Actualizar
                    </button>
                </div>

                {/* Table Area */}
                <div className="animate-fade-in delay-200">
                    {isLoading ? (
                        <div className="text-center py-32 glass-panel rounded-3xl border-dashed border-white/5">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-brand-primary-500/20 blur-2xl rounded-full"></div>
                                <RefreshCw className="animate-spin text-brand-primary-500 relative z-10" size={48} strokeWidth={2.5} />
                            </div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Escaneando inventario...</p>
                        </div>
                    ) : (
                        <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl shadow-black/40">
                            <ProductTable
                                productos={filteredProductos}
                                onEdit={handleEditarProducto}
                                onDelete={handleEliminarProducto}
                            />
                        </div>
                    )}
                </div>

                <ProductModal
                    isOpen={isModalOpen}
                    onClose={handleCerrarModal}
                    onSave={handleGuardarProducto}
                    producto={selectedProducto}
                    categorias={categorias}
                    ubicaciones={ubicaciones}
                />
            </div>
        </div>
    );
}
