"use client"

import { useData } from "@/lib/store"
import { Calendar, Users, Ticket, CheckCircle2, Trash2, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { SeasonTicketDialog, SingleGameSaleDialog } from "@/components/TicketDialogs"

export default function TicketsPage() {
    const { seasonTicketHolders, addSeasonTicketHolder, updateSeasonTicketHolder, deleteSeasonTicketHolder, games, singleGameSales, addSingleGameSale, updateSingleGameSale, deleteSingleGameSale } = useData()
    const [selectedYear, setSelectedYear] = useState("2026")

    // Filter Season Tickets by Year
    const yearHolders = seasonTicketHolders.filter(h => h.year === selectedYear)
    const grandTotalSeasonDocs = yearHolders.reduce((acc, h) => acc + parseInt(h.value?.replace(/[^0-9]/g, '') || "0"), 0)
    const totalSeasonSeats = yearHolders.reduce((acc, h) => acc + parseInt(h.seatCount || "0"), 0)

    // Calculate Single Game Sales Stats
    // For demo, assuming games are in selected year or just showing all for now if games don't have year property explicitly checked against filter yet.
    // Let's filter games by selected year if possible. The Mock games are "Jun 12", etc.
    // In store.tsx I updated INITIAL_GAMES to have "2026-06-12" format.
    // Calculate Single Game Sales Stats
    const yearGames = games.filter(g => g.date.includes(selectedYear))
    const relevantSales = singleGameSales.filter(s => yearGames.some(g => g.id === s.gameId))

    // Revenue Calcs
    const totalSingleTicketRevenue = relevantSales.reduce((acc, s) => acc + parseInt(s.price?.replace(/[^0-9]/g, '') || "0"), 0)
    const totalSingleFees = relevantSales.reduce((acc, s) => acc + parseInt(s.fees?.replace(/[^0-9]/g, '') || "0"), 0)
    const totalSingleGross = totalSingleTicketRevenue + totalSingleFees

    // Box Office Form State
    const [boGame, setBoGame] = useState("")
    const [boCustomer, setBoCustomer] = useState("")
    const [boQty, setBoQty] = useState("1")
    const [boPrice, setBoPrice] = useState("")
    const [boFees, setBoFees] = useState("")
    const [boSection, setBoSection] = useState("GA")

    const handleBoxOfficeSubmit = () => {
        if (boGame && boCustomer && boPrice) {
            addSingleGameSale({
                id: Math.random().toString(36).substr(2, 9),
                gameId: boGame,
                customer: boCustomer,
                quantity: parseInt(boQty) || 1,
                section: boSection,
                price: boPrice.includes('$') ? boPrice : `$${boPrice}`,
                fees: boFees ? (boFees.includes('$') ? boFees : `$${boFees}`) : "$0",
                status: "Paid"
            })
            // Reset form
            setBoCustomer("")
            setBoPrice("")
            setBoFees("")
            setBoQty("1")
            alert("Sale Processed!")
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Ticket Sales & Box Office</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[100px] h-8">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {["2025", "2026", "2027", "2028"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Overview Stats (Season + Single Game Combined for selected Year) */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(grandTotalSeasonDocs + totalSingleGross).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total Collected</p>
                    </CardContent>
                </Card>

                {/* Calculated Fees Stats - Summing up from stored data */}
                {(() => {
                    const parse = (s: string | undefined) => parseFloat((s || "0").replace(/[^0-9.]/g, '') || "0");

                    const totalTax = [
                        ...yearHolders.map(h => parse(h.tax)),
                        ...relevantSales.map(s => parse(s.tax))
                    ].reduce((a, b) => a + b, 0);

                    const totalProcessingFees = [
                        ...yearHolders.map(h => parse(h.ccFee)),
                        ...relevantSales.map(s => parse(s.ccFee))
                    ].reduce((a, b) => a + b, 0);

                    const totalTicketFees = [
                        ...yearHolders.map(h => parse(h.ticketFee)),
                        ...relevantSales.map(s => parse(s.ticketFee))
                    ].reduce((a, b) => a + b, 0);

                    const totalNet = [
                        ...yearHolders.map(h => h.subtotal ? parse(h.subtotal) : parse(h.value)),
                        ...relevantSales.map(s => s.subtotal ? parse(s.subtotal) : parse(s.price))
                    ].reduce((a, b) => a + b, 0);

                    return (
                        <>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sales Tax</CardTitle>
                                    <div className="h-4 w-4 text-red-500 font-bold">%</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <p className="text-xs text-muted-foreground">Liability</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Processing & Ticket Fees</CardTitle>
                                    <div className="h-4 w-4 text-orange-500 font-bold">-</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${(totalProcessingFees + totalTicketFees).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <p className="text-xs text-muted-foreground">CC: ${totalProcessingFees.toFixed(2)} | Tix: ${totalTicketFees.toFixed(2)}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <p className="text-xs text-muted-foreground">Available Cash</p>
                                </CardContent>
                            </Card>
                        </>
                    )
                })()}
            </div>

            <Tabs defaultValue="season" className="w-full">
                <TabsList>
                    <TabsTrigger value="season">Season Tickets</TabsTrigger>
                    <TabsTrigger value="single">Single Game & Box Office</TabsTrigger>
                </TabsList>

                <TabsContent value="season" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Season Ticket Holders ({selectedYear})</CardTitle>
                                <CardDescription>Manage subscriber accounts. Total Sold: <span className="font-bold text-foreground">{totalSeasonSeats}</span></CardDescription>
                            </div>
                            <SeasonTicketDialog year={selectedYear} onSave={addSeasonTicketHolder} />
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 font-medium text-muted-foreground">Name</th>
                                        <th className="text-left py-3 font-medium text-muted-foreground">Contact</th>
                                        <th className="text-left py-3 font-medium text-muted-foreground">Phone</th>
                                        <th className="text-center py-3 font-medium text-muted-foreground">Section</th>
                                        <th className="text-center py-3 font-medium text-muted-foreground">Seats</th>
                                        <th className="text-right py-3 font-medium text-muted-foreground">Value</th>
                                        <th className="text-center py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="text-right py-3 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearHolders.map(holder => (
                                        <tr key={holder.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-3 font-medium">{holder.name}</td>
                                            <td className="py-3 text-muted-foreground">{holder.contact}</td>
                                            <td className="py-3 text-muted-foreground">{holder.phone}</td>
                                            <td className="py-3 text-center">{holder.section}</td>
                                            <td className="py-3 text-center">{holder.seatCount}</td>
                                            <td className="py-3 text-right font-medium">{holder.value}</td>
                                            <td className="py-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs ${holder.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {holder.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <SeasonTicketDialog
                                                        year={selectedYear}
                                                        existingHolder={holder}
                                                        onSave={(updated) => updateSeasonTicketHolder(holder.id, updated)}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this season ticket holder?')) {
                                                                deleteSeasonTicketHolder(holder.id)
                                                            }
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {yearHolders.length === 0 && (
                                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No season ticket holders found for {selectedYear}.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="single" className="mt-6 flex flex-col gap-6">
                    {/* Box Office Input */}
                    <Card className="bg-muted/30 border-dashed">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Ticket className="h-5 w-5" /> Box Office Quick Sale
                            </CardTitle>
                            <CardDescription>Process a walk-up or single game sale immediately.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-6 gap-4 items-end">
                                <div className="col-span-2">
                                    <Label className="text-xs mb-1.5 block">Game</Label>
                                    <Select value={boGame} onValueChange={setBoGame}>
                                        <SelectTrigger><SelectValue placeholder="Select Game" /></SelectTrigger>
                                        <SelectContent>
                                            {yearGames.map(g => (
                                                <SelectItem key={g.id} value={g.id}>{g.opponent} ({new Date(g.date).toLocaleDateString()})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs mb-1.5 block">Customer</Label>
                                    <Input placeholder="Name" value={boCustomer} onChange={e => setBoCustomer(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1.5 block">Section</Label>
                                    <Input placeholder="Sec" value={boSection} onChange={e => setBoSection(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1.5 block">Qty</Label>
                                    <Input type="number" value={boQty} onChange={e => setBoQty(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1.5 block">Ticket ($)</Label>
                                    <Input placeholder="0.00" value={boPrice} onChange={e => setBoPrice(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1.5 block">Fees ($)</Label>
                                    <Input placeholder="0.00" value={boFees} onChange={e => setBoFees(e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <Button onClick={handleBoxOfficeSubmit} className="w-full">Process Sale</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6">
                        {yearGames.map(game => {
                            const gameSales = singleGameSales.filter(s => s.gameId === game.id)
                            const gameRevenue = gameSales.reduce((acc, s) => acc + parseInt(s.price?.replace(/[^0-9]/g, '') || "0"), 0)
                            const gameFees = gameSales.reduce((acc, s) => acc + parseInt(s.fees?.replace(/[^0-9]/g, '') || "0"), 0)
                            const ticketsSold = gameSales.reduce((acc, s) => acc + s.quantity, 0)

                            return (
                                <Card key={game.id}>
                                    <CardHeader className="flex flex-row items-center justify-between py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 p-2 rounded text-primary font-bold text-center min-w-[60px]">
                                                <div className="text-xs uppercase leading-none">{new Date(game.date).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="text-xl leading-none">{new Date(game.date).getDate()}</div>
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{game.opponent} <span className="text-muted-foreground font-normal">({game.location})</span></CardTitle>
                                                <CardDescription>{game.time} • Revenue: ${(gameRevenue + gameFees).toLocaleString()} • Sold: {ticketsSold}</CardDescription>
                                            </div>
                                        </div>
                                        <SingleGameSaleDialog gameId={game.id} gameName={`${game.opponent} (${game.date})`} onSave={addSingleGameSale} />
                                    </CardHeader>
                                    {gameSales.length > 0 && (
                                        <CardContent className="pb-4 pt-0">
                                            <div className="bg-muted/30 rounded-md p-2">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left font-medium text-muted-foreground py-1">Customer</th>
                                                            <th className="text-center font-medium text-muted-foreground py-1">Type</th>
                                                            <th className="text-center font-medium text-muted-foreground py-1">Qty</th>
                                                            <th className="text-right font-medium text-muted-foreground py-1">Ticket Price</th>
                                                            <th className="text-right font-medium text-muted-foreground py-1">Fees</th>
                                                            <th className="text-right font-medium text-muted-foreground py-1">Total</th>
                                                            <th className="text-right font-medium text-muted-foreground py-1">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gameSales.map(sale => (
                                                            <tr key={sale.id} className="border-t border-muted/20">
                                                                <td className="py-1">{sale.customer}</td>
                                                                <td className="py-1 text-center">{sale.section}</td>
                                                                <td className="py-1 text-center">{sale.quantity}</td>
                                                                <td className="py-1 text-right">{sale.price}</td>
                                                                <td className="py-1 text-right text-muted-foreground">{sale.fees || '$0'}</td>
                                                                <td className="py-1 text-right font-medium">
                                                                    ${(parseInt(sale.price?.replace(/[^0-9]/g, '') || "0") + parseInt(sale.fees?.replace(/[^0-9]/g, '') || "0")).toLocaleString()}
                                                                </td>
                                                                <td className="py-1 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <SingleGameSaleDialog
                                                                            gameId={game.id}
                                                                            gameName={`${game.opponent}`}
                                                                            existingSale={sale}
                                                                            onSave={(updated) => updateSingleGameSale(sale.id, updated)}
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm('Delete this sale?')) {
                                                                                    deleteSingleGameSale(sale.id || "") // Ensure ID exists or handle appropriately if optional in type (it's not)
                                                                                }
                                                                            }}
                                                                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            )
                        })}
                        {yearGames.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">No games scheduled for {selectedYear}. Please add games in Operations.</div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
