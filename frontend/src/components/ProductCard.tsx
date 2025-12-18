import type { Producto } from '../types';
import { Package, Plus } from 'lucide-react';

interface ProductCardProps {
    product: Producto;
    onAdd: (product: Producto) => void;
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
    const hasStock = product.cantidadStock > 0;

    return (
        <div
            className={`
                group relative flex flex-col justify-between 
                glass-panel rounded-3xl overflow-hidden
                transition-all duration-500
                ${!hasStock ? 'opacity-40 pointer-events-none grayscale' : 'hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary-500/10 hover:border-brand-primary-500/30'}
                border border-white/5
            `}
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg">
                        {product.sku}
                    </span>
                    <span
                        className={`
                            text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-tighter
                            ${hasStock ? 'bg-brand-primary-500/10 text-brand-primary-400' : 'bg-red-500/10 text-red-400'}
                        `}
                    >
                        <Package size={12} strokeWidth={2.5} />
                        {hasStock ? `${product.cantidadStock} Disponibles` : 'Agotado'}
                    </span>
                </div>

                <h3 className="font-black text-white text-lg leading-tight mb-6 min-h-[3rem] line-clamp-2 group-hover:text-brand-primary-400 transition-colors">
                    {product.nombre}
                </h3>

                <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Precio</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-brand-primary-400">Q</span>
                            <span className="text-3xl font-black text-white">
                                {product.precioVenta.toFixed(2)}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 mt-1">
                            Mayorista: Q{product.precioMayorista.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => onAdd(product)}
                        disabled={!hasStock}
                        className="
                            mb-1 p-4 rounded-2xl bg-brand-primary-500 text-white shadow-brand-primary-500/30 shadow-xl
                            hover:bg-brand-primary-400 active:scale-95 transition-all duration-300
                            disabled:bg-white/5 disabled:shadow-none disabled:text-gray-600
                            group-hover:rotate-6
                        "
                        title={hasStock ? "Agregar al carrito" : "Sin stock"}
                    >
                        <Plus size={22} strokeWidth={3} />
                    </button>
                </div>
            </div>
            {/* Subtle glow effect */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-primary-500/5 rounded-full blur-3xl group-hover:bg-brand-primary-500/10 transition-all duration-500"></div>
        </div>
    );
};
