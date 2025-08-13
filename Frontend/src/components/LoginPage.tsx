import AuthLayout from '@/components/AuthLayout.tsx'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
    return (
        <AuthLayout>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Track meals. Hit your goals.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                </div>

                <Button className="w-full">Log In</Button>
            </div>
        </AuthLayout>
    )
}
