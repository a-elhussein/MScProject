import { Card, CardHeader, CardContent } from '@/components/ui/card'
import {type ReactNode} from "react";

type AuthLayoutProps = {children: ReactNode}

export default function AuthLayout({ children }: AuthLayoutProps)  {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="pb-0" />
                <CardContent className="space-y-6 p-6">
                    {children}
                </CardContent>
            </Card>
        </div>
    )
}