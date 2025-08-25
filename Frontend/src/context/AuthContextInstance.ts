import { createContext } from "react";

export interface AuthUser {
    userId: string;
    username: string;
    email: string;
    roles: string[];
    exp: number;
}

export interface AuthContextType {
    user: AuthUser | null;
    isAuthed: boolean;
    login: (token: string, remember: boolean) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);