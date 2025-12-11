"use client"

import { useState } from "react"
import { useData } from "@/lib/store"
import { PlayerDialog } from "@/components/PlayerDialog"
import { PlayerList } from "@/components/PlayerList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"

export default function PlayersPage() {
    const { addPlayer, updatePlayer } = useData()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null)

    const handleSave = (data: any) => {
        if (selectedPlayer) {
            updatePlayer(selectedPlayer.id, data)
        } else {
            addPlayer({
                ...data,
                id: Math.random().toString(36).substr(2, 9)
            })
        }
        setIsDialogOpen(false)
        setSelectedPlayer(null)
    }

    const handleEdit = (player: any) => {
        setSelectedPlayer(player)
        setIsDialogOpen(true)
    }

    const parseCurrency = (val: string) => parseFloat(val?.replace(/[^0-9.]/g, '') || "0")

    const totals = (useData().players || []).reduce((acc, player) => {
        const seasonVal = parseCurrency(player.amountDue)
        const fee = parseCurrency(player.fees)
        const paid = parseCurrency(player.paidAmount)
        const balance = parseCurrency(player.balance)

        return {
            gross: acc.gross + seasonVal, // User: Gross not include fees
            fees: acc.fees + fee,
            net: acc.net + (seasonVal - fee), // User: Net accounts for fees
            paid: acc.paid + paid,
            balance: acc.balance + balance
        }
    }, { gross: 0, fees: 0, net: 0, paid: 0, balance: 0 })

    const format = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Player Portal</h2>
                    <p className="text-muted-foreground">Manage registrations and payments.</p>
                </div>
                <Button onClick={() => { setSelectedPlayer(null); setIsDialogOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" /> Register Player
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">Gross Player Fees</div>
                    <div className="text-2xl font-bold mt-2">{format(totals.gross)}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">Processing Fees</div>
                    <div className="text-2xl font-bold mt-2 text-red-500">{format(totals.fees)}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">Net Player Fees</div>
                    <div className="text-2xl font-bold mt-2 text-green-600">{format(totals.net)}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">Amount Paid</div>
                    <div className="text-2xl font-bold mt-2">{format(totals.paid)}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">Remaining Due</div>
                    <div className="text-2xl font-bold mt-2 text-blue-600">{format(totals.balance)}</div>
                </div>
            </div>

            <PlayerList onEdit={handleEdit} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <PlayerDialog player={selectedPlayer} onSave={handleSave} />
            </Dialog>
        </div>
    )
}
