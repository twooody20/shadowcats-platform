"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, DollarSign, Calendar, Settings, Users, Ticket } from "lucide-react" // Ensure these are installed
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Sponsorships", href: "/sponsorships", icon: Briefcase },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Players", href: "/players", icon: Users },
    { name: "CRM", href: "/crm", icon: Users },
    { name: "Financials", href: "/financials", icon: DollarSign },
    { name: "Operations", href: "/operations", icon: Calendar },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex h-16 items-center justify-center border-b border-sidebar-foreground/10 px-6">
                <h1 className="text-xl font-bold tracking-tight text-white">
                    <span className="text-accent">S</span>hadowcats
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
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-foreground/10",
                                isActive ? "bg-sidebar-foreground/20 text-white" : "text-gray-400"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>
            <div className="border-t border-sidebar-foreground/10 p-4 space-y-2">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-sidebar-foreground/10 hover:text-white">
                    <Settings className="h-5 w-5" />
                    Settings
                </button>
                <form action="/api/auth/signout" method="POST">
                    <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-sidebar-foreground/10 hover:text-red-400">
                        <Users className="h-5 w-5" />
                        Logout
                    </button>
                </form>
            </div>
        </div>
    )
}
