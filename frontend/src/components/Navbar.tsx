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
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-2 shrink-0 mr-2 xl:mr-6">
                        <img
                            src="/logo.png"
                            alt="Librería María y José"
                            className="h-12 w-auto object-contain py-1"
                        />
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 whitespace-nowrap">
                                LIBRERÍA
                            </span>
                            <span className="text-[10px] font-bold text-brand-primary-400 tracking-wider whitespace-nowrap">
                                MARÍA Y JOSÉ
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-1 xl:gap-2 overflow-x-auto no-scrollbar py-2">
                        <Link
                            to="/"
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold whitespace-nowrap
                                ${isActive('/') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            `}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Dashboard
                        </Link>

                        <Link
                            to="/ventas"
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold whitespace-nowrap
                                ${isActive('/ventas') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            `}
                        >
                            <Receipt className="h-4 w-4" />
                            Ventas
                        </Link>

                        <Link
                            to="/pos"
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold whitespace-nowrap
                                ${isActive('/pos') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                            `}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Punto de Venta
                        </Link>

                        <Link
                            to="/clientes"
                            className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold whitespace-nowrap
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
                                        flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold whitespace-nowrap
                                        ${isActive('/inventario') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                                    `}
                                >
                                    <Package className="h-4 w-4" />
                                    Inventario
                                </Link>

                                <Link
                                    to="/catalogos"
                                    className={`
                                        flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold whitespace-nowrap
                                        ${isActive('/catalogos') ? 'bg-brand-primary-500 text-white shadow-lg shadow-brand-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
                                    `}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Catálogos
                                </Link>

                                <Link
                                    to="/usuarios"
                                    className={`
                                        flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-semibold whitespace-nowrap
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
                    <div className="flex items-center gap-2 xl:gap-4 shrink-0">
                        <button
                            onClick={handleLogoutClick}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                                ${sesionActiva
                                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                            `}
                            title={sesionActiva ? "Cerrar Caja para Salir" : "Cerrar Sesión"}
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">{sesionActiva ? 'Cerrar Caja' : 'Salir'}</span>
                        </button>

                        <div className="pl-2 border-l border-gray-700">
                            <StatusBadge sesion={sesionActiva} />
                        </div>

                        {/* User Info Badge */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <div className="w-8 h-8 rounded-full bg-brand-primary-600 flex items-center justify-center text-white font-bold shrink-0">
                                {user?.nombreCompleto?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden xl:block">
                                <p className="text-white font-bold leading-none mb-0.5">{user?.nombreCompleto}</p>
                                <p className="opacity-70">{user?.rol}</p>
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
