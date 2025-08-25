import { type ReactNode, useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import { AuthContext } from "./AuthContextInstance";
interface AuthUser {
    userId: string;
    username: string;
    email: string;
    roles: string[];
    exp: number;
}


interface JwtPayload {
    nameid: string;
    unique_name: string;
    email: string;
    role: string | string[];
    exp: number;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode<JwtPayload>(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    const decodedUser: AuthUser = {
                        userId: decodedToken.nameid,
                        username: decodedToken.unique_name,
                        email: decodedToken.email,
                        roles: Array.isArray(decodedToken.role) ? decodedToken.role : [decodedToken.role],
                        exp: decodedToken.exp,
                    };
                    setUser(decodedUser);
                }
            } catch {
                logout();
            }
        }
    }, []);

    const login = (token: string, remember: boolean) => {
        if (remember) localStorage.setItem("token", token);
        else sessionStorage.setItem("token", token);
        const decodedToken = jwtDecode<JwtPayload>(token);
        const decoded: AuthUser = {
            userId: decodedToken.nameid,
            username: decodedToken.unique_name,
            email: decodedToken.email,
            roles: Array.isArray(decodedToken.role)
                ? decodedToken.role
                : [decodedToken.role],
            exp: decodedToken.exp,
        };
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthed: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

};
