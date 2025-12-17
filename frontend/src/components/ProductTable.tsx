import { Edit2, Trash2, AlertTriangle } from 'lucide-react';
import type { Producto } from '../types';

interface ProductTableProps {
    productos: Producto[];
    onEdit: (producto: Producto) => void;
    onDelete: (id: number) => void;
}

export default function ProductTable({ productos, onEdit, onDelete }: ProductTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    };

    const isLowStock = (stock: number) => stock < 5;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                SKU
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                Categoría
                            </th>
                            <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                                Precio Venta
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <AlertTriangle className="h-12 w-12 text-gray-400" />
                                        <p className="text-lg font-medium">No hay productos registrados</p>
                                        <p className="text-sm">Comienza agregando tu primer producto</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            productos.map((producto) => (
                                <tr
                                    key={producto.productoId}
                                    className={`
                                        transition-all duration-200 hover:bg-gray-50
                                        ${isLowStock(producto.cantidadStock)
                                            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500'
                                            : ''
                                        }
                                    `}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium text-gray-900">
                                                {producto.sku}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {producto.nombre}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
                                            {producto.categoria.nombre}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(producto.precioVenta)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {isLowStock(producto.cantidadStock) && (
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                            )}
                                            <span
                                                className={`
                                                    inline-flex rounded-lg px-3 py-1 text-sm font-bold
                                                    ${isLowStock(producto.cantidadStock)
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }
                                                `}
                                            >
                                                {producto.cantidadStock}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(producto)}
                                                className="group rounded-lg bg-blue-50 p-2 transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                                                title="Editar producto"
                                            >
                                                <Edit2 className="h-4 w-4 text-blue-600 transition-colors group-hover:text-white" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(producto.productoId)}
                                                className="group rounded-lg bg-red-50 p-2 transition-all duration-200 hover:bg-red-600 hover:shadow-lg"
                                                title="Eliminar producto"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600 transition-colors group-hover:text-white" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
