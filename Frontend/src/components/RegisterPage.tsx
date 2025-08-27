import AuthLayout from '@/components/AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '@/api/auth'
import {Checkbox} from "@/components/ui/checkbox";
import {useAuth} from "@/context/useAuth";

export default function RegisterPage() {
  const  {login} = useAuth();
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname?: string } } }

  // controlled inputs
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // ui state
  const [remember, setRemember] = useState(false) // store token in local (true) or session (false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const tokenResp = await apiRegister(username.trim(), email.trim(), password);
      const tokenStr = typeof tokenResp === "string" ? tokenResp : tokenResp.jwtToken;
      await login(tokenStr, remember);

      const redirectTo = location?.state?.from?.pathname ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? 'Registration failed')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start tracking in minutes.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-sm text-red-600" aria-live="polite">{error}</p>}

        <div className="flex items-center gap-2">
          <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(Boolean(v))}
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground">
            Remember me
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={loading || !username || !email || !password}>
          {loading ? 'Signing up…' : 'Sign Up'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}