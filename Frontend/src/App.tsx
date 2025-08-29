import './App.css'
import LoginPage from "@/pages/LoginPage.tsx";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import AppLayout from "@/components/AppLayout.tsx";
import RegisterPage from "@/pages/RegisterPage.tsx";
import type {ReactNode} from "react";
import {clearToken, getToken, isTokenExpired} from "@/lib/auth";
import DashboardPage from "@/pages/DashboardPage.tsx";
import LogPage from "@/pages/LogPage.tsx";
import RequireProfile from "@/components/RequireProfile.tsx";
import UserProfilePage from "@/pages/UserProfilePage.tsx";


const RequireAuth = ({children}: { children: ReactNode }) => {
    const location = useLocation();
    const token = getToken();
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    if (isTokenExpired(token)) {
        clearToken();
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
};

const PublicOnly = ({ children }: { children: ReactNode }) => {
    const token = getToken();
    return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="/login" element={ <PublicOnly><LoginPage/></PublicOnly>}/>
            <Route path="/register" element={<PublicOnly><RegisterPage/></PublicOnly>}/>

            <Route
                path="/dashboard"
                element={
                    <RequireAuth>
                        <AppLayout>
                            <DashboardPage/>
                        </AppLayout>
                    </RequireAuth>
                }
            />
            <Route
                path="/log"
                element={
                    <RequireAuth>
                        <RequireProfile>
                        <AppLayout>
                            <LogPage/>
                        </AppLayout>
                        </RequireProfile>
                    </RequireAuth>
                }
            />
            <Route
                path="/user-profile"
                element={
                    <RequireAuth>
                        <AppLayout>
                            <UserProfilePage/>
                        </AppLayout>
                    </RequireAuth>
                }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
    )
}

export default App
