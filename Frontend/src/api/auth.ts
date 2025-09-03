import api from "@/lib/axios";
import {toast} from "sonner";


type AppResponse<T> ={
    data: T;
    errorExist: boolean;
    errorMessage: string | null;
};

type LoginData = {jwtToken: string};

export async function register(username: string, email: string, password: string) {
    const {data} = await api.post<AppResponse<LoginData>>("/api/User/Register", {
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