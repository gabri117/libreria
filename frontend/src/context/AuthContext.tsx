import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface User {
    usuarioId: number;
    username: string;
    nombreCompleto: string;
    rol: string;
    token?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Init auth from session storage (clears when window closes)
        const storedUser = sessionStorage.getItem('pos_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from storage", e);
                sessionStorage.removeItem('pos_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        sessionStorage.setItem('pos_user', JSON.stringify(userData));
        if (userData.token) {
            sessionStorage.setItem('token', userData.token);
        }
        toast.success(`Bienvenido, ${userData.nombreCompleto}`);
        navigate('/');
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('pos_user');
        sessionStorage.removeItem('token');
        navigate('/login');
        toast.success('Sesión cerrada correctamente');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
