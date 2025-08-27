import { type ReactNode } from "react";
import {Link, useNavigate} from "react-router-dom"
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {clearToken} from "@/lib/auth.ts";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet.tsx";



type AppLayoutProps = { children: ReactNode }

export default function AppLayout({ children }: AppLayoutProps) {
    const nav = useNavigate();

    function onLogout() {
        clearToken();
        nav("/login", {replace: true});
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-card border-b">
                <div className="mx-auto max-w-5xl h-14 grid grid-cols-3 items-center px-4">
                    <div className="justify-self-start">
                        <Link to="/dashboard" className="font-semibold hover:opacity-90">
                            FoodTrack
                        </Link>
                    </div>

                    <div className="justify-self-center">
                        <NavigationMenu className="hidden md:block">
                            <NavigationMenuList className="gap-2">
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to="/dashboard"
                                            className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Dashboard
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to="/log"
                                            className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Log
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to="/stats"
                                            className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Stats
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Button asChild size="sm" variant="ghost" className="ml-2">
                                        <Link to="/log">Log Food</Link>
                                    </Button>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                    <div className="justify-self-end flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onLogout}>
                            Logout
                        </Button>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm" className="md:hidden">
                                    Menu
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="p-4">
                                <nav className="grid gap-3">
                                    <Link to="/dashboard" className="text-sm">
                                        Dashboard
                                    </Link>
                                    <Link to="/log" className="text-sm">
                                        Log
                                    </Link>
                                    <Link to="/stats" className="text-sm">
                                        Stats
                                    </Link>
                                    <Button asChild variant="secondary" className="mt-2">
                                        <Link to="/log">Log Food</Link>
                                    </Button>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
    );
}