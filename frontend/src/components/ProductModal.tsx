import { X, Save, Package, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Producto, ProductoFormData, Categoria, Ubicacion } from '../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (producto: ProductoFormData) => Promise<void>;
    producto?: Producto | null;
    categorias: Categoria[];
    ubicaciones: Ubicacion[];
}

export default function ProductModal({
    isOpen,
    onClose,
    onSave,
    producto,
    categorias,
    ubicaciones
}: ProductModalProps) {
    const [formData, setFormData] = useState<ProductoFormData>({
        nombre: '',
        sku: '',
        precioVenta: 0,
        precioMayorista: 0,
        precioCosto: 0,
        cantidadStock: 0,
        categoriaId: 0,
        ubicacionId: 0,
        descripcion: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ProductoFormData, string>>>({});

    useEffect(() => {
        if (producto) {
            setFormData({
                nombre: producto.nombre,
                sku: producto.sku,
                precioVenta: producto.precioVenta,
                precioMayorista: producto.precioMayorista,
                precioCosto: producto.precioCosto,
                cantidadStock: producto.cantidadStock,
                categoriaId: producto.categoria.categoriaId,
                ubicacionId: producto.ubicacion.ubicacionId,
                descripcion: producto.descripcion || ''
            });
        } else {
            setFormData({
                nombre: '',
                sku: '',
                precioVenta: 0,
                precioMayorista: 0,
                precioCosto: 0,
                cantidadStock: 0,
                categoriaId: categorias[0]?.categoriaId || 0,
                ubicacionId: ubicaciones[0]?.ubicacionId || 0,
                descripcion: ''
            });
        }
        setErrors({});
    }, [producto, isOpen, categorias, ubicaciones]);

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ProductoFormData, string>> = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (!formData.sku.trim()) {
            newErrors.sku = 'El SKU es requerido';
        }
        if (formData.precioVenta <= 0) {
            newErrors.precioVenta = 'El precio de venta debe ser mayor a 0';
        }
        if (formData.precioMayorista < 0) {
            newErrors.precioMayorista = 'El precio mayorista no puede ser negativo';
        }
        if (formData.precioCosto < 0) {
            newErrors.precioCosto = 'El precio de costo no puede ser negativo';
        }
        if (formData.cantidadStock < 0) {
            newErrors.cantidadStock = 'El stock no puede ser negativo';
        }
        if (!formData.categoriaId || formData.categoriaId === 0) {
            newErrors.categoriaId = 'Debe seleccionar una categoría';
        }
        if (!formData.ubicacionId || formData.ubicacionId === 0) {
            newErrors.ubicacionId = 'Debe seleccionar una ubicación';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error al guardar producto:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof ProductoFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-fade-in"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-2xl glass-panel rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="glass-card p-4 rounded-2xl border-white/10 text-brand-primary-400 shadow-lg shadow-brand-primary-500/10">
                            <Package size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                                {producto ? 'Editar Producto' : 'Nuevo Producto'}
                            </h2>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Información detallada del artículo</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5 hover:border-white/10"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="h-4 w-1 bg-brand-primary-500 rounded-full"></span>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Información General</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Nombre del Producto</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-primary-400 transition-colors">
                                            <Package size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => handleChange('nombre', e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                            placeholder="Ej. Cuaderno Profesional 100 Hojas"
                                        />
                                    </div>
                                    {errors.nombre && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.nombre}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Código SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => handleChange('sku', e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-mono font-bold uppercase tracking-widest"
                                        placeholder="SKU-000"
                                    />
                                    {errors.sku && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.sku}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary-400 transition-colors">Existencia Inicial</label>
                                    <input
                                        type="number"
                                        value={formData.cantidadStock}
                                        onChange={(e) => handleChange('cantidadStock', parseInt(e.target.value) || 0)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-primary-500/50 focus:ring-4 focus:ring-brand-primary-500/10 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pricing */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="h-4 w-1 bg-brand-secondary-500 rounded-full"></span>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Costos y Precios</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-secondary-400 transition-colors">P. Venta (Q)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.precioVenta}
                                        onChange={(e) => handleChange('precioVenta', parseFloat(e.target.value) || 0)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-secondary-500/50 focus:ring-4 focus:ring-brand-secondary-500/10 transition-all font-bold text-lg"
                                    />
                                    {errors.precioVenta && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.precioVenta}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-secondary-400 transition-colors">P. Mayorista (Q)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.precioMayorista}
                                        onChange={(e) => handleChange('precioMayorista', parseFloat(e.target.value) || 0)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-secondary-500/50 focus:ring-4 focus:ring-brand-secondary-500/10 transition-all font-bold text-lg"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-secondary-400 transition-colors">P. Costo (Q)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.precioCosto}
                                        onChange={(e) => handleChange('precioCosto', parseFloat(e.target.value) || 0)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-brand-secondary-500/50 focus:ring-4 focus:ring-brand-secondary-500/10 transition-all font-bold text-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Classification */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="h-4 w-1 bg-indigo-500 rounded-full"></span>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Clasificación</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">Categoría</label>
                                    <select
                                        value={formData.categoriaId}
                                        onChange={(e) => handleChange('categoriaId', parseInt(e.target.value))}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value={0} className="bg-slate-900">Seleccionar...</option>
                                        {categorias.map(cat => (
                                            <option key={cat.categoriaId} value={cat.categoriaId} className="bg-slate-900">{cat.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.categoriaId && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.categoriaId}</p>}
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">Ubicación</label>
                                    <select
                                        value={formData.ubicacionId}
                                        onChange={(e) => handleChange('ubicacionId', parseInt(e.target.value))}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value={0} className="bg-slate-900">Seleccionar...</option>
                                        {ubicaciones.map(ubi => (
                                            <option key={ubi.ubicacionId} value={ubi.ubicacionId} className="bg-slate-900">{ubi.nombreCorto}</option>
                                        ))}
                                    </select>
                                    {errors.ubicacionId && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.ubicacionId}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Description */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="h-4 w-1 bg-gray-500 rounded-full"></span>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Adicional</h3>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-white transition-colors">Descripción del Producto</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => handleChange('descripcion', e.target.value)}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all font-bold min-h-[120px] resize-none"
                                    placeholder="Detalles técnicos, marca, material, etc..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 glass-card border-white/5 text-gray-400 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        form="product-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] bg-brand-primary-500 hover:bg-brand-primary-400 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-brand-primary-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50 border border-brand-primary-400/20"
                    >
                        {isSubmitting ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} strokeWidth={2.5} />
                        )}
                        {isSubmitting ? 'Procesando...' : (producto ? 'Guardar Cambios' : 'Crear Producto')}
                    </button>
                </div>
            </div>
        </div>
    );
}
