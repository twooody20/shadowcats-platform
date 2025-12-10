"use client"

import { useData, Player } from "@/lib/store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface PlayerListProps {
    onEdit: (player: Player) => void
}

export function PlayerList({ onEdit }: PlayerListProps) {
    const { players, deletePlayer } = useData()

    if (!players || players.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">No players registered yet.</div>
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Season</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Fees</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {players.map((player) => {
                        // Helper to parse currency
                        const parse = (val: string) => parseFloat(val?.replace(/[^0-9.]/g, '') || "0")
                        const format = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

                        const net = parse(player.amountDue) // Base Season Price
                        const fee = parse(player.fees)
                        const gross = net
                        const netRevenue = gross - fee

                        return (
                            <TableRow key={player.id}>
                                <TableCell className="font-medium">
                                    <div>{player.name}</div>
                                    <div className="text-xs text-muted-foreground">{player.email}</div>
                                </TableCell>
                                <TableCell>{player.seasonType}</TableCell>
                                <TableCell>
                                    <div>{player.paymentType}</div>
                                    <div className="text-xs text-muted-foreground">{player.paymentMethod}</div>
                                </TableCell>
                                <TableCell className="text-right">{format(gross)}</TableCell>
                                <TableCell className="text-right text-red-500">{player.fees}</TableCell>
                                <TableCell className="text-right font-bold text-green-600">{format(netRevenue)}</TableCell>
                                <TableCell className="text-right text-blue-600">{player.paidAmount}</TableCell>
                                <TableCell className={`text-right ${player.balance !== "$0" ? "text-red-500 font-medium" : "text-green-600"}`}>
                                    {player.balance}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${player.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {player.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(player)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deletePlayer(player.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
