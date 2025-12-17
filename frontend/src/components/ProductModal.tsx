import { X, Save, Package } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/20 p-2">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {producto ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-white transition-colors hover:bg-white/20"
                        disabled={isSubmitting}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Nombre */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                className={`w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2 ${errors.nombre
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                placeholder="Ej: Cuaderno Profesional"
                                disabled={isSubmitting}
                            />
                            {errors.nombre && (
                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                            )}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                SKU *
                            </label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => handleChange('sku', e.target.value)}
                                className={`w-full rounded-lg border px-4 py-3 font-mono transition-all focus:outline-none focus:ring-2 ${errors.sku
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                placeholder="Ej: CUA-001"
                                disabled={isSubmitting}
                            />
                            {errors.sku && (
                                <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                            )}
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Stock Inicial *
                            </label>
                            <input
                                type="number"
                                value={formData.cantidadStock}
                                onChange={(e) => handleChange('cantidadStock', parseInt(e.target.value) || 0)}
                                className={`w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2 ${errors.cantidadStock
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                min="0"
                                disabled={isSubmitting}
                            />
                            {errors.cantidadStock && (
                                <p className="mt-1 text-sm text-red-600">{errors.cantidadStock}</p>
                            )}
                        </div>

                        {/* Precio Venta */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Precio Venta *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precioVenta}
                                    onChange={(e) => handleChange('precioVenta', parseFloat(e.target.value) || 0)}
                                    className={`w-full rounded-lg border px-4 py-3 pl-8 transition-all focus:outline-none focus:ring-2 ${errors.precioVenta
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500'
                                        }`}
                                    min="0"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.precioVenta && (
                                <p className="mt-1 text-sm text-red-600">{errors.precioVenta}</p>
                            )}
                        </div>

                        {/* Precio Mayorista */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Precio Mayorista *
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precioMayorista}
                                    onChange={(e) => handleChange('precioMayorista', parseFloat(e.target.value) || 0)}
                                    className={`w-full rounded-lg border px-4 py-3 pl-8 transition-all focus:outline-none focus:ring-2 ${errors.precioMayorista
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500'
                                        }`}
                                    min="0"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.precioMayorista && (
                                <p className="mt-1 text-sm text-red-600">{errors.precioMayorista}</p>
                            )}
                        </div>

                        {/* Precio Costo */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Precio Costo
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precioCosto}
                                    onChange={(e) => handleChange('precioCosto', parseFloat(e.target.value) || 0)}
                                    className={`w-full rounded-lg border px-4 py-3 pl-8 transition-all focus:outline-none focus:ring-2 ${errors.precioCosto
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500'
                                        }`}
                                    min="0"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.precioCosto && (
                                <p className="mt-1 text-sm text-red-600">{errors.precioCosto}</p>
                            )}
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Categoría *
                            </label>
                            <select
                                value={formData.categoriaId}
                                onChange={(e) => handleChange('categoriaId', parseInt(e.target.value))}
                                className={`w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2 ${errors.categoriaId
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                disabled={isSubmitting}
                            >
                                <option value={0}>Seleccionar categoría</option>
                                {categorias.map((cat) => (
                                    <option key={cat.categoriaId} value={cat.categoriaId}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.categoriaId && (
                                <p className="mt-1 text-sm text-red-600">{errors.categoriaId}</p>
                            )}
                        </div>

                        {/* Ubicación */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Ubicación *
                            </label>
                            <select
                                value={formData.ubicacionId}
                                onChange={(e) => handleChange('ubicacionId', parseInt(e.target.value))}
                                className={`w-full rounded-lg border px-4 py-3 transition-all focus:outline-none focus:ring-2 ${errors.ubicacionId
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                disabled={isSubmitting}
                            >
                                <option value={0}>Seleccionar ubicación</option>
                                {ubicaciones.map((ubi) => (
                                    <option key={ubi.ubicacionId} value={ubi.ubicacionId}>
                                        {ubi.nombreCorto}
                                    </option>
                                ))}
                            </select>
                            {errors.ubicacionId && (
                                <p className="mt-1 text-sm text-red-600">{errors.ubicacionId}</p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Descripción
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => handleChange('descripcion', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows={3}
                                placeholder="Descripción detallada del producto..."
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-8 flex gap-3 border-t border-gray-200 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            <Save className="h-5 w-5" />
                            {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
