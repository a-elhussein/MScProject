import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "@/context/AuthContext.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
            retry: 0,
            staleTime: 30_000,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
        </AuthProvider>
        </QueryClientProvider>
    </StrictMode>,
)
