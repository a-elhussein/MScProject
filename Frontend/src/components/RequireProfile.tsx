import {type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {useUserProfile} from "@/context/useUserProfile";


export default function RequireProfile({ children }: { children: ReactNode }) {
    const { data: profile, isLoading, isError } = useUserProfile();
    const location = useLocation();

    if (isLoading) return null;
    if (isError) return <Navigate to="/dashboard" replace state={{ from: location, reason: "profileError" }} />;

    if (!profile) {
        return <Navigate to="/dashboard" replace state={{ from: location, reason: "noProfile" }} />;
    }

    return <>{children}</>;
}