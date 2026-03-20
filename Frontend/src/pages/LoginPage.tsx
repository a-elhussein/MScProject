import AuthLayout from '@/components/AuthLayout.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Button } from '@/components/ui/button.tsx'
import {type FormEvent, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {login} from "@/api/auth.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {useAuth} from "@/context/useAuth.tsx";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const {login: loginWithContext} = useAuth();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await login(username, password);
            loginWithContext(token, remember);
            const redirectTo = location?.state?.from?.pathname ?? 'dashboard'
            toast.success("Welcome back!");
            navigate(redirectTo, {replace: true});
        } catch (err: unknown) {
            const axiosError = err as AxiosError;

            const rawMessage = axiosError?.response?.data;
            const errorMsg =
                typeof rawMessage === "string"
                    ? rawMessage
                    : "Login failed. Please try again.";

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold">Welcome Back</h1>
                <p className="text-sm text-muted-foreground">Track Meals. Hit Your Goals.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </div>

                <Button type={"submit"} className="w-full" disabled={loading}>
                    {loading ? 'Logging in…' : 'Log In'}
                </Button>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="remember"
                        checked={remember}
                        onCheckedChange={(v) => setRemember(Boolean(v))}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember Me
                    </Label>
                </div>
            </form>

            <p className="text-center text-sm text-muted-foreground">
                Don't have An Account?{' '}
                <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                    Register
                </Link>
            </p>
        </AuthLayout>
    );
}
