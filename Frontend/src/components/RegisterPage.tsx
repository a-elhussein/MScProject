import AuthLayout from '@/components/AuthLayout'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Button } from '@/components/ui/button.tsx'

export default function RegisterPage() {
  return (
      <AuthLayout>
          <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold">Create your account</h1>
              <p className="text-sm text-muted-foreground">Start tracking in minutes.</p>
          </div>

          <div className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="AD" />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
              </div>

              <Button className="w-full">Sign Up</Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-primary underline-offset-4 hover:underline">
                  Log in
              </a>
          </p>
      </AuthLayout>
  )
}