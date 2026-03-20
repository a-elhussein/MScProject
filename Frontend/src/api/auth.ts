import { AxiosError } from "axios";
import api from "@/lib/axios";
import {toast} from "sonner";


type AppResponse<T> ={
    data: T;
    errorExist: boolean;
    errorMessage: string | null;
};

type LoginData = {jwtToken: string};

export async function register(username: string, email: string, password: string) {
    try {
        const { data } = await api.post<AppResponse<LoginData>>("/api/User/Register", {
            username,
            email,
            password,
        });

        if (data.errorExist || !data.data) {
            toast.error(data.errorMessage ?? "Signup failed");
            throw new Error(data.errorMessage ?? "Request failed");
        }

        toast.success("Account created", {
            description: "You can now log in.",
        });

        return data.data;
    } catch (err: unknown) {
        const axiosErr = err as AxiosError;
        const resData = axiosErr?.response?.data as Record<string, unknown> | string | undefined;

        const message =
            typeof resData === "string"
                ? resData.replace(/^.*?:\s*/, "") ?? "Signup failed"
                : typeof resData === "object" && resData !== null && "errors" in resData
                    ? Object.values((resData as { [key: string]: string[] }).errors)[0]?.[0] || "Signup failed"
                    : typeof resData === "object" && resData !== null
                        ? Object.values(resData)[0]?.toString().replace(/^.*?:\s*/, "") || "Signup failed"
                        : "Signup failed";

        toast.error(message);
        throw new Error(message);
    }
}

export async function login(username: string,password: string) {
    const {data} = await api.post<AppResponse<LoginData>>("/api/User/Login", {
        username,
        password
    });

    if (data.errorExist || !data.data) {
        toast.error(data.errorMessage ?? "Login failed");
        throw new Error(data.errorMessage ?? "Request failed");
    }

    toast.success("Logged in", {
        description: "Welcome back!",
    });

    return data.data.jwtToken;
}