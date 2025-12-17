import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, LogOut, BookOpen, Users, TrendingUp } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { StatusBadge } from './CashControl/StatusBadge';
import { ClosingModal } from './CashControl/ClosingModal';

export default function Navbar() {
    const location = useLocation();
    const { sesionActiva, cerrarSesion } = useSession(); // Get session state
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="bg-gray-900 border-b border-gray-800 text-white shadow-lg z-50 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Librería POS
                        </span>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link
                            to="/"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/')
                                    ? 'bg-gray-800 text-white ring-1 ring-gray-700'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }
                            `}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Dashboard
                        </Link>

                        <Link
                            to="/pos"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/pos')
                                    ? 'bg-gray-800 text-white ring-1 ring-gray-700'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }
                            `}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Punto de Venta
                        </Link>

                        <Link
                            to="/inventario"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/inventario')
                                    ? 'bg-gray-800 text-white ring-1 ring-gray-700'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }
                            `}
                        >
                            <Package className="h-4 w-4" />
                            Inventario
                        </Link>

                        <Link
                            to="/catalogos"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/catalogos')
                                    ? 'bg-gray-800 text-white ring-1 ring-gray-700'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }
                            `}
                        >
                            <BookOpen className="h-4 w-4" />
                            Catálogos
                        </Link>

                        <Link
                            to="/clientes"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/clientes')
                                    ? 'bg-gray-800 text-white ring-1 ring-gray-700'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }
                            `}
                        >
                            <Users className="h-4 w-4" />
                            Clientes
                        </Link>
                    </nav>

                    {/* Logout Button (Visual only) */}
                    {/* Logout / Close Box Button */}
                    <button
                        onClick={() => {
                            if (sesionActiva) setIsClosingModalOpen(true);
                        }}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${sesionActiva
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                : 'text-gray-600 cursor-not-allowed opacity-50'}
                        `}
                        title={sesionActiva ? "Cerrar Caja" : "Caja ya cerrada"}
                    >
                        <LogOut className="h-4 w-4" />
                        <span>{sesionActiva ? 'Cerrar Caja' : 'Salir'}</span>
                    </button>

                    <div className="ml-4 pl-4 border-l border-gray-700">
                        <StatusBadge sesion={sesionActiva} />
                    </div>
                </div>
            </div>

            <ClosingModal
                isOpen={isClosingModalOpen}
                onCloseSesion={async (monto) => {
                    await cerrarSesion(monto);
                    setIsClosingModalOpen(false);
                }}
                onCancel={() => setIsClosingModalOpen(false)}
            />
        </header>
    );
}
