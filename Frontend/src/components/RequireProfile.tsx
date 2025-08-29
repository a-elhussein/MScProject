import {type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {useUserProfile} from "@/context/useUserProfile";


export default function RequireProfile({ children }: { children: ReactNode }) {
    const { data: profile, isLoading, isError } = useUserProfile();
    const location = useLocation();

    if (isLoading) return null; // or a spinner/skeleton
    // If failed for a reason other than "not found", you might still allow entry or handle differently.
    if (isError) return <Navigate to="/dashboard" replace state={{ from: location, reason: "profileError" }} />;

    if (!profile) {
        // No profile -> send user to dashboard (or a dedicated /profile screen)
        return <Navigate to="/dashboard" replace state={{ from: location, reason: "noProfile" }} />;
    }

    return <>{children}</>;
}