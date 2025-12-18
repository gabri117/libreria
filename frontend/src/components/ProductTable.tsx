import { Edit3, Trash2, Box, ChevronRight, AlertCircle } from 'lucide-react';
import type { Producto } from '../types';

interface ProductTableProps {
    productos: Producto[];
    onEdit: (producto: Producto) => void;
    onDelete: (id: number) => void;
}

export default function ProductTable({ productos, onEdit, onDelete }: ProductTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ'
        }).format(value);
    };

    const isLowStock = (stock: number) => stock < 5;

    return (
        <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Producto</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Categoría</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Precio Venta</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Stock</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {productos.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-24 text-center">
                                <div className="flex flex-col items-center gap-4 opacity-40">
                                    <Box size={64} className="text-gray-500" strokeWidth={1} />
                                    <div>
                                        <p className="text-white font-black uppercase tracking-widest text-sm">Almacén Vacío</p>
                                        <p className="text-gray-500 text-xs font-bold uppercase mt-1">No se encontraron productos registrados</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        productos.map((producto) => (
                            <tr
                                key={producto.productoId}
                                className="group hover:bg-white/[0.03] transition-all duration-300"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="glass-card p-3 rounded-xl border-white/5 bg-white/5 text-brand-primary-400 group-hover:scale-110 group-hover:bg-brand-primary-500/10 transition-all duration-300">
                                            <Box size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="text-white font-black tracking-tight leading-none mb-1 group-hover:text-brand-primary-400 transition-colors">
                                                {producto.nombre}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">SKU:</span>
                                                <code className="text-[10px] font-mono font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {producto.sku}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary-500/10 border border-brand-primary-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></div>
                                        <span className="text-[10px] font-black text-brand-primary-400 uppercase tracking-widest leading-none mt-0.5">
                                            {producto.categoria.nombre}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex flex-col items-end">
                                        <div className="text-lg font-black text-white tracking-tighter">
                                            {formatCurrency(producto.precioVenta)}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Costo:</span>
                                            <span className="text-[10px] font-bold text-gray-500 line-through decoration-red-500/50">
                                                {formatCurrency(producto.precioCosto || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`
                                            flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-sm tracking-tighter transition-all duration-500
                                            ${isLowStock(producto.cantidadStock)
                                                ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                                : 'bg-brand-secondary-500/10 border-brand-secondary-500/30 text-brand-secondary-400'
                                            }
                                        `}>
                                            {isLowStock(producto.cantidadStock) && <AlertCircle size={14} strokeWidth={3} className="animate-pulse" />}
                                            {producto.cantidadStock}
                                        </div>
                                        {isLowStock(producto.cantidadStock) && (
                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.1em] mt-1">Surtir pronto</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(producto)}
                                            className="p-3 glass-card border-white/5 text-gray-500 hover:text-brand-primary-400 hover:border-brand-primary-500/30 hover:bg-brand-primary-500/5 rounded-xl transition-all active:scale-90 group/btn"
                                            title="Editar Producto"
                                        >
                                            <Edit3 size={16} strokeWidth={2.5} className="group-hover/btn:rotate-12 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(producto.productoId)}
                                            className="p-3 glass-card border-white/5 text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 rounded-xl transition-all active:scale-90 group/btn"
                                            title="Eliminar Producto"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                        <div className="w-px h-6 bg-white/5 mx-1"></div>
                                        <button className="p-2 text-gray-700 hover:text-white transition-colors">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
