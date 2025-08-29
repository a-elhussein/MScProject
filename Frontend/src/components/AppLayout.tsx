import { type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

type AppLayoutProps = { children: ReactNode }

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
            <Toaster richColors position="top-right" />
        </div>
    );
}