import { useState, useEffect } from 'react';
import {
    Plus,
    Tags,
    MapPin,
    Truck,
    Pencil,
    Trash2,
    Search,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from '../services/categoriaService';
import {
    obtenerUbicaciones,
    crearUbicacion,
    actualizarUbicacion,
    eliminarUbicacion
} from '../services/ubicacionService';
import {
    obtenerProveedores,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor
} from '../services/proveedorService';

import type { Categoria, Ubicacion, Proveedor, ProveedorFormData } from '../types';

type CatalogType = 'categorias' | 'ubicaciones' | 'proveedores';

export default function CatalogsPage() {
    const [activeTab, setActiveTab] = useState<CatalogType>('categorias');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [cats, ubis, provs] = await Promise.all([
                obtenerCategorias(),
                obtenerUbicaciones(),
                obtenerProveedores()
            ]);
            setCategorias(cats);
            setUbicaciones(ubis);
            setProveedores(provs);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este elemento?')) return;

        try {
            if (activeTab === 'categorias') await eliminarCategoria(id);
            else if (activeTab === 'ubicaciones') await eliminarUbicacion(id);
            else await eliminarProveedor(id);

            toast.success('Eliminado correctamente');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar. Podría estar en uso.');
        }
    };

    const filteredData = () => {
        const query = searchQuery.toLowerCase();
        if (activeTab === 'categorias') return categorias.filter(c => c.nombre.toLowerCase().includes(query));
        if (activeTab === 'ubicaciones') return ubicaciones.filter(u => u.nombreCorto.toLowerCase().includes(query));
        return proveedores.filter(p => p.nombreEmpresa.toLowerCase().includes(query));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Catálogos</h1>
                    <p className="text-gray-500">Categorías, Ubicaciones y Proveedores del sistema</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo {activeTab === 'categorias' ? 'Categoría' : activeTab === 'ubicaciones' ? 'Ubicación' : 'Proveedor'}
                </button>
            </header>

            {/* Tabs */}
            <div className="mb-8 flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('categorias')}
                    className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'categorias'
                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <Tags className="h-4 w-4" />
                    Categorías
                </button>
                <button
                    onClick={() => setActiveTab('ubicaciones')}
                    className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'ubicaciones'
                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <MapPin className="h-4 w-4" />
                    Ubicaciones
                </button>
                <button
                    onClick={() => setActiveTab('proveedores')}
                    className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'proveedores'
                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <Truck className="h-4 w-4" />
                    Proveedores
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-indigo-500" />
                        <p className="font-medium">Cargando catálogo...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    {activeTab === 'categorias' && (
                                        <>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Nombre</th>
                                            <th className="px-6 py-4">Descripción</th>
                                        </>
                                    )}
                                    {activeTab === 'ubicaciones' && (
                                        <>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Nombre Corto</th>
                                            <th className="px-6 py-4">Descripción</th>
                                        </>
                                    )}
                                    {activeTab === 'proveedores' && (
                                        <>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Empresa</th>
                                            <th className="px-6 py-4">Contacto</th>
                                            <th className="px-6 py-4">Teléfono</th>
                                        </>
                                    )}
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData().map((item: any) => (
                                    <tr key={activeTab === 'categorias' ? item.categoriaId : activeTab === 'ubicaciones' ? item.ubicacionId : item.proveedorId} className="hover:bg-gray-50/80 transition-colors group">
                                        {activeTab === 'categorias' && (
                                            <>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">#{item.categoriaId}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.nombre}</td>
                                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.descripcion || '-'}</td>
                                            </>
                                        )}
                                        {activeTab === 'ubicaciones' && (
                                            <>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">#{item.ubicacionId}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.nombreCorto}</td>
                                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.descripcion}</td>
                                            </>
                                        )}
                                        {activeTab === 'proveedores' && (
                                            <>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">#{item.proveedorId}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.nombreEmpresa}</td>
                                                <td className="px-6 py-4 text-gray-500">{item.nombreContacto}</td>
                                                <td className="px-6 py-4 text-gray-500">{item.telefono}</td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(activeTab === 'categorias' ? item.categoriaId : activeTab === 'ubicaciones' ? item.ubicacionId : item.proveedorId)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData().length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                                            No se encontraron elementos
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* TODO: Add CatalogModal here */}
            {isModalOpen && (
                <CatalogModal
                    type={activeTab}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={loadData}
                    item={editingItem}
                />
            )}
        </div>
    );
}

// Inline Modal Component for simplicity in this artifact
function CatalogModal({ type, isOpen, onClose, onSave, item }: any) {
    const [formData, setFormData] = useState<any>(
        item || (type === 'categorias' ? { nombre: '', descripcion: '' } :
            type === 'ubicaciones' ? { nombreCorto: '', descripcion: '' } :
                { nombreEmpresa: '', nombreContacto: '', telefono: '', email: '', nitProveedor: '' })
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (type === 'categorias') {
                if (item) await actualizarCategoria(item.categoriaId, formData);
                else await crearCategoria(formData);
            } else if (type === 'ubicaciones') {
                if (item) await actualizarUbicacion(item.ubicacionId, formData);
                else await crearUbicacion(formData);
            } else {
                if (item) await actualizarProveedor(item.proveedorId, formData);
                else await crearProveedor(formData);
            }
            toast.success('Guardado correctamente');
            onSave();
            onClose();
        } catch (error) {
            toast.error('Error al guardar');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <h3 className="text-xl font-bold">{item ? 'Editar' : 'Nuevo'} {type === 'categorias' ? 'Categoría' : type === 'ubicaciones' ? 'Ubicación' : 'Proveedor'}</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
                    {type === 'categorias' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea className="w-full border rounded-lg p-2" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                            </div>
                        </>
                    )}
                    {type === 'ubicaciones' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Corto</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.nombreCorto} onChange={e => setFormData({ ...formData, nombreCorto: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea required className="w-full border rounded-lg p-2" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                            </div>
                        </>
                    )}
                    {type === 'proveedores' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Empresa</label>
                                <input required className="w-full border rounded-lg p-2" value={formData.nombreEmpresa} onChange={e => setFormData({ ...formData, nombreEmpresa: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Contacto</label>
                                    <input className="w-full border rounded-lg p-2" value={formData.nombreContacto} onChange={e => setFormData({ ...formData, nombreContacto: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                                    <input className="w-full border rounded-lg p-2" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">NIT</label>
                                <input className="w-full border rounded-lg p-2" value={formData.nitProveedor} onChange={e => setFormData({ ...formData, nitProveedor: e.target.value })} />
                            </div>
                        </>
                    )}
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 font-bold text-gray-500 hover:bg-gray-50">Cancelar</button>
                        <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-lg py-2 font-bold hover:bg-indigo-700 shadow-md">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
