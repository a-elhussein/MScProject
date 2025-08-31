import { Navigate } from "react-router-dom";
import type {ReactNode} from "react";
import {useAuth} from "@/context/useAuth.tsx";


export default function RequireAdmin({ children }: { children: ReactNode }) {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}