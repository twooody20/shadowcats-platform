"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useData } from "@/lib/store"
import { useState, useEffect } from "react"

export function InventoryChart({ year = "2026" }: { year?: string }) {
    const [isMounted, setIsMounted] = useState(false)
    const { inventory, deals } = useData()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    // Helper: is deal active in selected year
    const isDealActiveInYear = (deal: any, targetYear: string) => {
        const startYear = new Date(deal.start).getFullYear()
        const endYear = new Date(deal.end).getFullYear()
        const target = parseInt(targetYear)
        return target >= startYear && target <= endYear
    }

    // Derive status logic
    // Derive status logic
    const soldCount = inventory.filter(i =>
        deals.some(d => d.assets?.includes(i.name) && d.status === 'Signed' && isDealActiveInYear(d, year))
    ).length

    const pendingCount = inventory.filter(i => {
        const isSold = deals.some(d => d.assets?.includes(i.name) && d.status === 'Signed' && isDealActiveInYear(d, year))
        const isPending = deals.some(d => d.assets?.includes(i.name) && d.status === 'Negotiating' && isDealActiveInYear(d, year))
        return !isSold && isPending
    }).length

    const availableCount = inventory.length - soldCount - pendingCount

    const data = [
        { name: "Sold", value: soldCount, color: "#10b981" },
        { name: "Available", value: availableCount, color: "#e5e7eb" },
        { name: "Pending", value: pendingCount, color: "#f59e0b" },
    ]

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
