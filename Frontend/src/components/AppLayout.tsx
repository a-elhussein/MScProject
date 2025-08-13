import {type ReactNode} from "react";
import { Link } from "react-router-dom"
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

type AppLayoutProps = { children: ReactNode }

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="bg-card">
                <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
                    <Link to="/dashboard" className="font-semibold hover:opacity-90">
                        FoodTrack
                    </Link>

                    <NavigationMenu>
                        <NavigationMenuList className="gap-2">
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground">
                                        Dashboard
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link to="/log" className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground">
                                        Log
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link to="/stats" className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground">
                                        Stats
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <Button asChild variant="secondary" className="h-9">
                        <Link to="/log">Log Food</Link>
                    </Button>
                </div>
                <Separator />
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6">
                {children}
            </main>
        </div>
    )
}