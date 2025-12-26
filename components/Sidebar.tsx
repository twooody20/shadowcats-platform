"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, DollarSign, Calendar, Settings, Users, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/ModeToggle"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Sponsorships", href: "/sponsorships", icon: Briefcase },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Players", href: "/players", icon: Users },
    { name: "CRM", href: "/crm", icon: Users },
    { name: "Budget", href: "/budget", icon: DollarSign },
    { name: "Operations", href: "/operations", icon: Calendar },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col bg-muted/40 border-r">
            <div className="flex h-16 items-center justify-center border-b px-6">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    <span className="text-primary">S</span>hadowcats
                </h1>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                                isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>
            <div className="border-t p-4 space-y-2">
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium text-muted-foreground">Theme</span>
                    <ModeToggle />
                </div>
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Settings className="h-5 w-5" />
                    Settings
                </button>
                <form action="/api/auth/signout" method="POST">
                    <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive">
                        <Users className="h-5 w-5" />
                        Logout
                    </button>
                </form>
            </div>
        </div>
    )
}
