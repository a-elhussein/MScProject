import api from "@/lib/axios";

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

    if (data.errorExist ||!data.data) {
        throw new Error(data.errorMessage ?? "Request failed");
    }

    return data.data;
}

export async function login(username: string,password: string) {
    const {data} = await api.post<AppResponse<LoginData>>("/api/User/Login", {
        username,
        password
    });

    if (data.errorExist ||!data.data) {
        throw new Error(data.errorMessage ?? "Request failed");
    }

    return data.data.jwtToken;
}