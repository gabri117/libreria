import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, LogOut, BookOpen, Users, TrendingUp, Shield, Receipt } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './CashControl/StatusBadge';
import { ClosingModal } from './CashControl/ClosingModal';

export default function Navbar() {
    const location = useLocation();
    const { sesionActiva, cerrarSesion, verificarSesion } = useSession();
    const { user, logout } = useAuth();
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogoutClick = async () => {
        if (sesionActiva) {
            // If session is active, ask to close it first
            await verificarSesion();
            setIsClosingModalOpen(true);
        } else {
            // Just logout
            logout();
        }
    };

    const isAdmin = user?.rol === 'Administrador';

    return (
        <header className="bg-gray-900 border-b border-gray-800 text-white shadow-lg z-50 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Librería María y José"
                            className="h-10 w-auto object-contain"
                        />
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                            Librería María y José
                        </span>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link
                            to="/"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            `}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Dashboard
                        </Link>

                        <Link
                            to="/ventas"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/ventas') ? 'bg-gray-800 text-white ring-1 ring-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            `}
                        >
                            <Receipt className="h-4 w-4" />
                            Ventas
                        </Link>

                        <Link
                            to="/pos"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/pos') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            `}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Punto de Venta
                        </Link>

                        <Link
                            to="/clientes"
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                ${isActive('/clientes') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            `}
                        >
                            <Users className="h-4 w-4" />
                            Clientes
                        </Link>

                        {/* Admin Only Links */}
                        {isAdmin && (
                            <>
                                <Link
                                    to="/inventario"
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                        ${isActive('/inventario') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                                    `}
                                >
                                    <Package className="h-4 w-4" />
                                    Inventario
                                </Link>

                                <Link
                                    to="/catalogos"
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                        ${isActive('/catalogos') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                                    `}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Catálogos
                                </Link>

                                <Link
                                    to="/usuarios"
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                        ${isActive('/usuarios') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                                    `}
                                >
                                    <Shield className="h-4 w-4" />
                                    Usuarios
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Right Side: Logout and Session Badge */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogoutClick}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${sesionActiva
                                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                            `}
                            title={sesionActiva ? "Cerrar Caja para Salir" : "Cerrar Sesión"}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>{sesionActiva ? 'Cerrar Caja' : 'Salir'}</span>
                        </button>

                        <div className="pl-4 border-l border-gray-700">
                            <StatusBadge sesion={sesionActiva} />
                        </div>

                        {/* User Info Badge */}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                {user?.nombreCompleto?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-white font-medium">{user?.nombreCompleto}</p>
                                <p>{user?.rol}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ClosingModal
                isOpen={isClosingModalOpen}
                sesion={sesionActiva}
                onCloseSesion={async (monto) => {
                    await cerrarSesion(monto);
                    setIsClosingModalOpen(false);
                    logout(); // Auto logout after closing session
                }}
                onCancel={() => setIsClosingModalOpen(false)}
            />
        </header>
    );
}
