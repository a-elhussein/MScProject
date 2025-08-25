// src/components/NavBar.tsx
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function navClasses(isActive: boolean) {
    return [
        "px-3 py-2 rounded-md text-sm transition-colors",
        isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
    ].join(" ");
}

export default function NavBar({ onLogout }: { onLogout?: () => void }) {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
            <div className="mx-auto max-w-5xl h-14 px-4 flex items-center justify-between gap-3">
                {/* Brand */}
                <Link to="/dashboard" className="font-semibold tracking-tight">
                    FoodTrack
                </Link>

                {/* Desktop nav */}
                <NavigationMenu className="hidden md:block">
                    <NavigationMenuList className="gap-1">
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <NavLink to="/dashboard" className={({ isActive }) => navClasses(isActive)}>
                                    Dashboard
                                </NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <NavLink to="/log" className={({ isActive }) => navClasses(isActive)}>
                                    Log
                                </NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <NavLink to="/stats" className={({ isActive }) => navClasses(isActive)}>
                                    Stats
                                </NavLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Right actions (desktop) */}
                <div className="hidden md:flex items-center gap-2">
                    <Button asChild variant="secondary" className="h-9">
                        <Link to="/log">Log Food</Link>
                    </Button>
                    {onLogout && (
                        <Button variant="ghost" className="h-9" onClick={onLogout}>
                            Logout
                        </Button>
                    )}
                </div>

                {/* Mobile menu (Sheet) */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="ghost" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-80">
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>

                        <div className="mt-4 flex flex-col gap-2">
                            <SheetClose asChild>
                                <Button asChild variant="ghost" className="justify-start">
                                    <NavLink to="/dashboard">Dashboard</NavLink>
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button asChild variant="ghost" className="justify-start">
                                    <NavLink to="/log">Log</NavLink>
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button asChild variant="ghost" className="justify-start">
                                    <NavLink to="/stats">Stats</NavLink>
                                </Button>
                            </SheetClose>

                            <Separator className="my-2" />

                            <SheetClose asChild>
                                <Button asChild variant="secondary">
                                    <NavLink to="/log">Log Food</NavLink>
                                </Button>
                            </SheetClose>

                            {onLogout && (
                                <Button variant="ghost" onClick={onLogout}>
                                    Logout
                                </Button>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}