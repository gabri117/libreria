import { useState, useEffect } from 'react';
import { Plus, Package, RefreshCw, Search } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4 shadow-lg">
                            <Package className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Gestión de Inventario
                            </h1>
                            <p className="mt-1 text-lg text-gray-600">
                                Administra tus productos y controla el stock
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {productos.length}
                                    </p>
                                </div>
                                <div className="rounded-full bg-indigo-100 p-3">
                                    <Package className="h-8 w-8 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                                    <p className="mt-2 text-3xl font-bold text-red-600">
                                        {productosConStockBajo}
                                    </p>
                                </div>
                                <div className="rounded-full bg-red-100 p-3">
                                    <Package className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">
                                        {new Intl.NumberFormat('es-MX', {
                                            style: 'currency',
                                            currency: 'MXN',
                                            minimumFractionDigits: 0
                                        }).format(valorTotalInventario)}
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <Package className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, SKU o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={cargarDatos}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>

                        <button
                            onClick={handleNuevoProducto}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                        >
                            <Plus className="h-5 w-5" />
                            Nuevo Producto
                        </button>
                    </div>
                </div>

                {/* Product Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-lg">
                        <div className="text-center">
                            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                            <p className="mt-4 text-lg font-medium text-gray-600">Cargando productos...</p>
                        </div>
                    </div>
                ) : (
                    <ProductTable
                        productos={filteredProductos}
                        onEdit={handleEditarProducto}
                        onDelete={handleEliminarProducto}
                    />
                )}

                {/* Product Modal */}
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
