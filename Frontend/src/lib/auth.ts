import {jwtDecode} from "jwt-decode";

const STORAGE_KEY = 'token';

export type StorageKind = "session" | "local";

export function setToken(token: string, kind: StorageKind = "session") {
    const store = kind === "local"? localStorage:sessionStorage;
    store.setItem(STORAGE_KEY, token);
}

export function getToken(): string|null {
    return sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
}

export function clearToken(){
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn(): boolean {
    return getToken() !== null;
}

type JwtPayload = { exp?: number };
export function isTokenExpired(token: string, skewMs = 30_000): boolean {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        if (!exp) return false;
        return Date.now() >= exp * 1000 - skewMs;
    } catch {
        return true;
    }
}