import './App.css'
import LoginPage from "@/components/LoginPage.tsx";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import AppLayout from "@/components/AppLayout.tsx";
import RegisterPage from "@/components/RegisterPage.tsx";
import type {ReactNode} from "react";
import {clearToken, getToken, isTokenExpired} from "@/lib/auth";
import DashboardPage from "@/components/DashboardPage.tsx";


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


const LogPage = () => <div>Log Food</div>
const StatsPage = () => <div>Stats</div>


function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/register" replace/>}/>
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
                        <AppLayout>
                            <LogPage/>
                        </AppLayout>
                    </RequireAuth>
                }
            />
            <Route
                path="/stats"
                element={
                    <RequireAuth>
                        <AppLayout>
                            <StatsPage/>
                        </AppLayout>
                    </RequireAuth>
                }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
        </Routes>
    )
}

export default App
