import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "@/context/AuthContext.tsx";

console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
)
