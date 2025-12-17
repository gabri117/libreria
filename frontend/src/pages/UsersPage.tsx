import { useState, useEffect } from 'react';
import { Users, Plus, Shield, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { obtenerUsuarios, crearUsuario, ROLES } from '../services/userService';

export default function UsersPage() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        username: '',
        password: '',
        rolId: 2 // Default Vendedor
    });

    const loadUsuarios = async () => {
        try {
            const data = await obtenerUsuarios();
            setUsuarios(data);
        } catch (error) {
            toast.error('Error cargando usuarios');
        }
    };

    useEffect(() => {
        loadUsuarios();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await crearUsuario(formData);
            toast.success('Usuario creado correctamente');
            setIsModalOpen(false);
            setFormData({ nombreCompleto: '', username: '', password: '', rolId: 2 });
            loadUsuarios();
        } catch (error) {
            toast.error('Error al crear usuario');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="text-indigo-600" />
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-500 mt-1">Administra el acceso al sistema</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 flex items-center gap-2 font-medium shadow-lg shadow-gray-200 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        Nuevo Usuario
                    </button>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {usuarios.map((user) => (
                        <div key={user.usuarioId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${user.rolNombre === 'Administrador' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{user.nombreCompleto}</h3>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {user.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Rol</span>
                                <span className="text-sm font-medium text-gray-700">{user.rolNombre}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create User Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Nuevo Usuario</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.nombreCompleto}
                                        onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Username)</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                        value={formData.rolId}
                                        onChange={e => setFormData({ ...formData, rolId: Number(e.target.value) })}
                                    >
                                        {ROLES.map(rol => (
                                            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors mt-4"
                                >
                                    Crear Usuario
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
