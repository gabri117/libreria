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
        bg-white rounded-xl shadow-sm border border-gray-100 
        transition-all duration-300 hover:shadow-md 
        ${!hasStock ? 'opacity-60 pointer-events-none grayscale' : 'hover:-translate-y-1'}
      `}
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded">
                        {product.sku}
                    </span>
                    <span
                        className={`
              text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1
              ${hasStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            `}
                    >
                        <Package size={12} />
                        {hasStock ? `${product.cantidadStock} en stock` : 'Agotado'}
                    </span>
                </div>

                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-4 min-h-[3rem] line-clamp-2">
                    {product.nombre}
                </h3>

                <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Precio</span>
                        <span className="text-2xl font-extrabold text-blue-600">
                            ${product.precioVenta.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            Mayorista: ${product.precioMayorista.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => onAdd(product)}
                        disabled={!hasStock}
                        className="
              mb-1 p-3 rounded-lg bg-blue-600 text-white shadow-blue-200 shadow-lg
              hover:bg-blue-700 active:scale-95 transition-all
              disabled:bg-gray-400 disabled:shadow-none
            "
                        title={hasStock ? "Agregar al carrito" : "Sin stock"}
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};
