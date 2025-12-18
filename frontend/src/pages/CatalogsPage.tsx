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

import type { Categoria, Ubicacion, Proveedor } from '../types';

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
        <div className="min-h-screen font-sans">
            <div className="max-w-full mx-auto p-4 sm:p-8">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-1 w-8 bg-brand-primary-500 rounded-full"></span>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Gestión de Catálogos</h1>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-11">Maestros de Categorías, Ubicaciones y Proveedores</p>
                    </div>

                    <button
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        className="bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-brand-primary-600/20 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs border border-brand-primary-400/20"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Nuevo {activeTab === 'categorias' ? 'Categoría' : activeTab === 'ubicaciones' ? 'Ubicación' : 'Proveedor'}
                    </button>
                </div>

                {/* Modern Tabs */}
                <div className="flex gap-2 p-2 glass-panel border-white/5 rounded-[2rem] mb-10 inline-flex animate-slide-up">
                    {[
                        { id: 'categorias', icon: Tags, label: 'Categorías' },
                        { id: 'ubicaciones', icon: MapPin, label: 'Ubicaciones' },
                        { id: 'proveedores', icon: Truck, label: 'Proveedores' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as CatalogType)}
                            className={`
                                flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 relative overflow-hidden group
                                ${activeTab === tab.id
                                    ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <tab.icon size={16} strokeWidth={2.5} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-shimmer"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Table Area */}
                <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl shadow-black/40 animate-fade-in delay-100">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-primary-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder={`Buscar por nombre de ${activeTab}...`}
                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-32 flex flex-col items-center justify-center text-gray-500">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-brand-primary-500/20 blur-2xl rounded-full"></div>
                                <Loader2 className="h-12 w-12 animate-spin text-brand-primary-500 relative z-10" strokeWidth={2.5} />
                            </div>
                            <p className="font-black uppercase tracking-[0.3em] text-xs">Sincronizando catálogos...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.01]">
                                        {activeTab === 'categorias' && (
                                            <>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">ID</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Nombre</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Descripción</th>
                                            </>
                                        )}
                                        {activeTab === 'ubicaciones' && (
                                            <>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">ID</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Nombre Corto</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Descripción</th>
                                            </>
                                        )}
                                        {activeTab === 'proveedores' && (
                                            <>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">ID</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Empresa</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Contacto</th>
                                                <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Teléfono</th>
                                            </>
                                        )}
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredData().map((item: any) => (
                                        <tr key={activeTab === 'categorias' ? item.categoriaId : activeTab === 'ubicaciones' ? item.ubicacionId : item.proveedorId} className="hover:bg-white/[0.03] transition-all duration-300 group">
                                            {activeTab === 'categorias' && (
                                                <>
                                                    <td className="px-6 py-5 font-mono text-[10px] font-bold text-gray-500">#{item.categoriaId}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-white font-black tracking-tight group-hover:text-brand-primary-400 transition-colors uppercase text-sm">
                                                            {item.nombre}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-gray-500 font-bold text-xs max-w-xs truncate">{item.descripcion || '-'}</td>
                                                </>
                                            )}
                                            {activeTab === 'ubicaciones' && (
                                                <>
                                                    <td className="px-6 py-5 font-mono text-[10px] font-bold text-gray-500">#{item.ubicacionId}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-white font-black tracking-tight group-hover:text-brand-primary-400 transition-colors uppercase text-sm">
                                                            {item.nombreCorto}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-gray-500 font-bold text-xs max-w-xs truncate">{item.descripcion}</td>
                                                </>
                                            )}
                                            {activeTab === 'proveedores' && (
                                                <>
                                                    <td className="px-6 py-5 font-mono text-[10px] font-bold text-gray-500">#{item.proveedorId}</td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-black tracking-tight group-hover:text-brand-primary-400 transition-colors uppercase text-sm">
                                                                {item.nombreEmpresa}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-600 mt-1">{item.nitProveedor || 'S/N NIT'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-gray-400 font-bold text-xs">{item.nombreContacto || '-'}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-brand-secondary-400 font-black text-xs tracking-widest">{item.telefono || '-'}</span>
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                                        className="p-3 glass-card border-white/5 text-gray-500 hover:text-brand-primary-400 hover:border-brand-primary-500/30 hover:bg-brand-primary-500/5 rounded-xl transition-all active:scale-90 group/btn"
                                                    >
                                                        <Pencil size={16} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(activeTab === 'categorias' ? item.categoriaId : activeTab === 'ubicaciones' ? item.ubicacionId : item.proveedorId)}
                                                        className="p-3 glass-card border-white/5 text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 rounded-xl transition-all active:scale-90 group/btn"
                                                    >
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData().length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-40">
                                                    <Tags size={64} className="text-gray-500" strokeWidth={1} />
                                                    <div>
                                                        <p className="text-white font-black uppercase tracking-widest text-sm">Lista Vacía</p>
                                                        <p className="text-gray-500 text-xs font-bold uppercase mt-1">No se encontraron elementos en esta categoría</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CatalogModal
                    type={activeTab}
                    onClose={() => setIsModalOpen(false)}
                    onSave={loadData}
                    item={editingItem}
                />
            )}
        </div>
    );
}

// Inline Modal Component for simplicity in this artifact
function CatalogModal({ type, onClose, onSave, item }: any) {
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

    const modalTitle = `${item ? 'Editar' : 'Nuevo'} ${type === 'categorias' ? 'Categoría' : type === 'ubicaciones' ? 'Ubicación' : 'Proveedor'}`;
    const Icon = type === 'categorias' ? Tags : type === 'ubicaciones' ? MapPin : Truck;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-fade-in"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg glass-panel rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="glass-card p-4 rounded-2xl border-white/10 text-brand-primary-400 shadow-lg shadow-brand-primary-500/10">
                            <Icon size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                                {modalTitle}
                            </h2>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">
                                {type.slice(0, -1)} del sistema
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5"
                    >
                        <Plus className="rotate-45" size={20} strokeWidth={3} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {type === 'categorias' && (
                        <>
                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Nombre de Categoría</label>
                                <input
                                    required
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Papelería"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Descripción</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold min-h-[100px] resize-none"
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Opcional..."
                                />
                            </div>
                        </>
                    )}

                    {type === 'ubicaciones' && (
                        <>
                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Nombre Corto</label>
                                <input
                                    required
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                    value={formData.nombreCorto}
                                    onChange={e => setFormData({ ...formData, nombreCorto: e.target.value })}
                                    placeholder="Ej. PASILLO-A"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Descripción Técnica</label>
                                <textarea
                                    required
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold min-h-[100px] resize-none"
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Ubicación detallada en el almacén..."
                                />
                            </div>
                        </>
                    )}

                    {type === 'proveedores' && (
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Nombre de la Empresa</label>
                                <input
                                    required
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                    value={formData.nombreEmpresa}
                                    onChange={e => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                                    placeholder="Distribuidora X"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Contacto</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all font-bold"
                                        value={formData.nombreContacto}
                                        onChange={e => setFormData({ ...formData, nombreContacto: e.target.value })}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Teléfono</label>
                                    <input
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 transition-all font-bold"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">NIT Proveedor</label>
                                <input
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold uppercase tracking-widest"
                                    value={formData.nitProveedor}
                                    onChange={e => setFormData({ ...formData, nitProveedor: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 glass-card border-white/5 text-gray-400 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-brand-primary-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-[10px] border border-brand-primary-400/20"
                        >
                            Guardar {type === 'proveedores' ? 'Proveedor' : type === 'ubicaciones' ? 'Ubicación' : 'Categoría'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
