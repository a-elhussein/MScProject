// src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "@/lib/auth";
import { useUserProfile } from "@/context/useUserProfile";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User } from "lucide-react";

export default function Navbar() {
    const nav = useNavigate();
    const { data: profile } = useUserProfile();

    function onLogout() {
        clearToken();
        nav("/login", { replace: true });
    }

    return (
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
                            {profile && (
                                <>
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                to="/log"
                                                className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
                                            >
                                                Log Food
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                to="/trends"
                                                className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
                                            >
                                                Trends
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="justify-self-end flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User className="h-4 w-4" />
                                <span className="sr-only">User menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to="/user-profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

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
                                {profile && (
                                    <>
                                        <Link to="/log" className="text-sm">
                                            Log
                                        </Link>
                                        <Link to="/stats" className="text-sm">
                                            Stats
                                        </Link>
                                        <Button asChild variant="secondary" className="mt-2">
                                            <Link to="/log">Log Food</Link>
                                        </Button>
                                    </>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}