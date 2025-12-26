"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { useData } from "@/lib/store"
import { useState, useEffect } from "react"

export function RevenueChart({ year = "2026" }: { year?: string }) {
    const [isMounted, setIsMounted] = useState(false)
    const { deals, singleGameSales, seasonTicketHolders, games, players } = useData()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    // Helper to parse currency string (align with Financials page)
    const parseValue = (val: string) => parseFloat(val?.replace(/[^0-9.]/g, '') || "0")

    // Filter Signed Deals
    const signedDeals = deals.filter(d =>
        d.status === 'Signed' &&
        (Number(year) >= new Date(d.start).getFullYear() && Number(year) <= new Date(d.end).getFullYear())
    )

    // Filter Tickets
    const yearGames = games.filter(g => g.date.includes(year))
    const yearGameIds = yearGames.map(g => g.id)
    const yearSingleSales = singleGameSales.filter(s => yearGameIds.includes(s.gameId))
    const yearSeasonHolders = seasonTicketHolders.filter(h => h.year === year)

    // Generate monthly data (Apr - Sep)
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"]
    const data = months.map(month => {
        const monthIndex = months.indexOf(month) + 4 // 4 = April

        // 1. Sponsorship Revenue
        const spsNet = signedDeals.reduce((acc, deal) => {
            const startMonth = new Date(deal.start).getMonth() + 1
            const startYear = new Date(deal.start).getFullYear()

            let isActive = false;
            if (startYear < Number(year)) isActive = true;
            if (startYear === Number(year) && startMonth <= monthIndex) isActive = true;

            if (isActive) {
                const gross = parseValue(deal.actualValue)
                const fees = parseValue(deal.processingFee || "0") + parseValue(deal.fulfillmentFee || "0")
                return acc + (gross - fees)
            }
            return acc
        }, 0)

        // 2. Ticket Revenue
        let tixNet = 0
        if (monthIndex >= 4) {
            tixNet += yearSeasonHolders.reduce((acc, h) => {
                const gross = parseValue(h.value)
                const sub = h.subtotal ? parseValue(h.subtotal) : gross
                return acc + sub
            }, 0)
        }
        yearSingleSales.forEach(s => {
            const game = games.find(g => g.id === s.gameId)
            if (game) {
                const gameDate = new Date(game.date)
                const gameMonth = gameDate.getMonth() + 1
                if (gameMonth <= monthIndex) {
                    const gross = parseValue(s.price)
                    const sub = s.subtotal ? parseValue(s.subtotal) : gross
                    tixNet += sub
                }
            }
        })

        // 3. Player Fees (Revenue)
        // Assume recognized in April (Start of Season) or when registered? 
        // Lacking date, we assume all current players are for this season, recognized Month 4.
        let plyNet = 0
        if (monthIndex >= 4 && year === "2026") {
            plyNet = (players || []).reduce((acc, p) => acc + parseValue(p.amountDue), 0)
        }

        return {
            name: month,
            total: spsNet + tixNet + plyNet,
            sponsorships: spsNet,
            tickets: tixNet,
            players: plyNet
        }
    })

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorSps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTix" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Legend />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Revenue"]} />
                <Area
                    type="monotone"
                    dataKey="sponsorships"
                    stroke="#7c3aed"
                    fillOpacity={1}
                    fill="url(#colorSps)"
                    stackId="1"
                    name="Sponsorships"
                />
                <Area
                    type="monotone"
                    dataKey="tickets"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorTix)"
                    stackId="1"
                    name="Tickets"
                />
                <Area
                    type="monotone"
                    dataKey="players"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorPly)"
                    stackId="1"
                    name="Player Fees"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
