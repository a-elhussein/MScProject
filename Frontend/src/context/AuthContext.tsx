import {type ReactNode, useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {AuthContext, type UserProfile} from "./AuthContextInstance";
import api from "@/lib/axios";
import {useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
interface AuthUser {
    userId: string;
    username: string;
    email: string;
    roles: string[];
    exp: number;
}


interface JwtPayload {
    [key: string]: unknown;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
    exp: number;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const qc = useQueryClient();

useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
        try {
            const decodedToken = jwtDecode<JwtPayload>(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                logout();
            } else {
                const rawRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
                const roles = Array.isArray(rawRole) ? rawRole : [rawRole];
                const decodedUser: AuthUser = {
                    userId: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] as string,
                    username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string,
                    email: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string,
                    roles,
                    exp: decodedToken.exp,
                };
                setUser(decodedUser);
            }
        } catch {
            logout();
        }
    }
}, []);

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common["Authorization"];
        }
    }, []);

    const login = async (token: string, remember: boolean) => {
        // 1) clear any cached queries from the previous user
        qc.clear();

        // 2) store token
        if (remember) localStorage.setItem("token", token);
        else sessionStorage.setItem("token", token);

        // 3) set axios header immediately
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 4) decode and set user
        const decodedToken = jwtDecode<JwtPayload>(token);
        console.log("Decoded token:", decodedToken);
        const rawRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        const roles = Array.isArray(rawRole) ? rawRole : [rawRole];
        const decoded: AuthUser = {
            userId: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] as string,
            username: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string,
            email: decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string,
            roles,
            exp: decodedToken.exp,
        };
        setUser(decoded);

        try {
            const res = await api.get("/api/user/userinfo");
            const userInfo = res.data?.data;

            if (userInfo?.isActive) {
                toast.error("Your account is inactive.", {
                    duration: 5000,
                });
                setTimeout(() => logout(), 100);
                return;
            }

            setUserProfile(userInfo);
        } catch {
            setUserProfile(null);
            logout();
            return;
        }

        // 5) preload profile so UI reacts right away
        try {
            const response = await api.get("/api/UserProfile/Get");
            const profile = response.data?.data;
            setUserProfile(profile ?? null);
        } catch {
            setUserProfile(null);
        }

        if (roles.some(role => role.toLowerCase() === "admin")) {
            window.location.href = "/admin";
        } else {
            window.location.href = "/dashboard";
        }
    };

    const logout = () => {
        // clear auth state
        setUser(null);
        setUserProfile(null);

        // remove tokens
        try {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
        } catch {
            // Intentionally ignore storage errors (e.g., Safari private mode)
        }

        // remove axios header
        delete api.defaults.headers.common["Authorization"];

        // clear all cached queries
        qc.clear();
    };

    return (
        <AuthContext.Provider value={{ user, isAuthed: !!user, login, logout, userProfile, setUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
