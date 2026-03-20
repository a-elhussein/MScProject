import {createContext, type Dispatch, type SetStateAction} from "react";

export interface AuthUser {
    userId: string;
    username: string;
    email: string;
    roles: string[];
    exp: number;
}

export type UserProfile = {
    dateOfBirth: string;
    heightCm: number;
    weightKg: number;
    activityLevel: number;
    goal: number;
    sex: number;
    timeZone?: string;
};

export interface AuthContextType {
    user: AuthUser | null;
    isAuthed: boolean;
    userProfile: UserProfile | null;
    setUserProfile: Dispatch<SetStateAction<UserProfile | null>>;
    login: (token: string, remember: boolean) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);