import axios from "axios";
import {clearToken, getToken} from "@/lib/auth.ts";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) =>{
    const token = getToken();
    if (token){
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                clearToken();
                setTimeout(() => window.location.replace("/login"), 0);
            }
        }
        return Promise.reject(err);
    }
);

export default api;