import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import axios from "axios";
import type {UserProfile} from "@/context/AuthContextInstance.ts";

type AppResponse<T> = { data: T; errorExist: boolean; errorMessage: string | null };


export function useUserProfile(opts?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: async (): Promise<UserProfile | null> => {
            try {
                const r = await api.get<AppResponse<UserProfile>>("/api/UserProfile/Get");
                return r.data?.data ?? null;
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && err.response?.status === 404) return null;
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000,
        ...opts,
    });
}