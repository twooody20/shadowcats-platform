"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { SeasonTicketHolder, SingleGameSale, useData } from "@/lib/store"
import { Search } from "lucide-react"

export function SeasonTicketDialog({ year, onSave, existingHolder }: { year: string, onSave: (holder: SeasonTicketHolder) => void, existingHolder?: SeasonTicketHolder }) {
    const { seasonTicketHolders, sponsors } = useData()
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<Partial<SeasonTicketHolder>>(existingHolder || { status: "Active", paymentMethod: "Check" }) // Default Check
    const [packageType, setPackageType] = useState<"Platinum" | "Reserved" | "Custom">("Custom")
    const [isCustomName, setIsCustomName] = useState(false)

    // Helper to calc breakdown based on Total Input
    const calculateBreakdown = (totalStr: string, method?: string) => {
        const total = parseFloat(totalStr.replace(/[^0-9.]/g, '') || "0");

        // 1. Tax Inclusive Logic: Total = Base * 1.0825
        // So Base = Total / 1.0825
        const baseRevenue = total / 1.0825;
        const tax = total - baseRevenue;

        // 2. CC Fees: 2.9% of TOTAL (if Card)
        const isCard = method === "Credit Card";
        const ccFee = isCard ? total * 0.029 : 0;

        // 3. Ticket Fee: Flat $0.99 (User Logic)
        const ticketFee = 0.99;

        // 4. Net = Base - CC - Ticket
        // Wait, strictly speaking: Net = Total - Tax - CC - Ticket
        // Or Net = BaseRevenue - CC - Ticket?
        // User example: 
        // Total 240. 
        // Base (before tax) = 221.71. (Correct: 240/1.0825 = 221.709)
        // Tax = 18.29.
        // CC = 6.96 (240 * 0.029).
        // Ticket = 0.99.
        // Net = 240 - 18.29 - 6.96 - 0.99 = 213.76.
        // Matches user "Net after tax & fees: 213.76"

        const net = total - tax - ccFee - ticketFee;

        // Formmatter
        const fmt = (n: number) => `$${n.toFixed(2)}`;

        return {
            tax: fmt(tax),
            ccFee: fmt(ccFee),
            ticketFee: fmt(ticketFee),
            net: fmt(net)
        }
    }

    // Only show existing Season Ticket Holders (e.g. for renewals), filtered by unique names.
    // We prioritize the record with the most complete data (phone/email) during deduplication to ensure we don't pick an empty historical record.
    const holderOptions = Array.from(
        seasonTicketHolders.reduce((map, holder) => {
            const existing = map.get(holder.name);
            // If new holder has more info (phone/email) than existing map entry, overwrite it.
            // Otherwise, keep existing. If neither has info, overwrite (default behavior).
            if (!existing || (holder.phone && !existing.data.phone) || (holder.email && !existing.data.email)) {
                map.set(holder.name, { id: holder.id, name: holder.name, data: holder });
            }
            return map;
        }, new Map<string, { id: string, name: string, data: SeasonTicketHolder }>()).values()
    );

    // Update value when package or seat count changes
    const updateValue = (type: string, seats: string) => {
        const count = parseInt(seats) || 0
        if (type === "Platinum") {
            const val = 10 * 24 * count // $10 * 24 games
            setData(prev => ({ ...prev, value: `$${val.toLocaleString()}` }))
        } else if (type === "Reserved") {
            const val = 6.5 * 24 * count // $6.50 * 24 games
            setData(prev => ({ ...prev, value: `$${val.toLocaleString()}` }))
        }
    }

    const handlePackageChange = (val: "Platinum" | "Reserved" | "Custom") => {
        setPackageType(val)
        updateValue(val, data.seatCount || "0")
    }

    const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seats = e.target.value
        setData({ ...data, seatCount: seats })
        updateValue(packageType, seats)
    }

    const handleSubmit = () => {
        if (data.name) {
            const finalContact = data.contact || "Primary Contact";

            onSave({
                id: existingHolder ? existingHolder.id : Math.random().toString(36).substr(2, 9),
                name: data.name,
                contact: finalContact,
                phone: data.phone || "",
                email: data.email || "",
                status: (data.status as any) || "Active",
                section: data.section || "",
                seatCount: data.seatCount || "1",
                value: data.value || "$0",
                year: year
            })
            setOpen(false)
            if (!existingHolder) {
                setData({ status: "Active" })
                setPackageType("Custom")
                setIsCustomName(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {existingHolder ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Edit</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                    </Button>
                ) : (
                    <Button>Sell Season Ticket ({year})</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingHolder ? `Edit Season Ticket` : `New Season Ticket Holder - ${year}`}</DialogTitle>
                    <DialogDescription>Enter subscriber details for the {year} season.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Pkg Type</Label>
                        <Select value={packageType} onValueChange={(val: any) => handlePackageChange(val)}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Custom">Custom</SelectItem>
                                <SelectItem value="Platinum">Platinum ($10/gm)</SelectItem>
                                <SelectItem value="Reserved">Reserved GA ($6.50/gm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Name</Label>
                        <div className="col-span-3 flex gap-2">
                            {existingHolder || isCustomName ? (
                                <>
                                    <Input value={data.name || ""} onChange={e => setData({ ...data, name: e.target.value })} className="flex-1" placeholder="Enter Name" />
                                    {!existingHolder && (
                                        <Button size="icon" variant="ghost" onClick={() => setIsCustomName(false)} title="Select Existing">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Select
                                    value={holderOptions.find(opt => opt.name === data.name)?.id || (data.name ? "custom" : "")}
                                    onValueChange={(val) => {
                                        if (val === "custom") {
                                            setIsCustomName(true)
                                            setData({ ...data, name: "" })
                                        } else {
                                            const selected = holderOptions.find(opt => opt.id === val);
                                            if (selected) {
                                                const source = selected.data;
                                                // Find matching sponsor to merge contact info if missing in holder record
                                                const matchingSponsor = sponsors.find(s => s.name === source.name);

                                                setData(prev => ({
                                                    ...prev,
                                                    name: source.name,
                                                    contact: source.contact || matchingSponsor?.contact || "",
                                                    email: source.email || matchingSponsor?.email || "",
                                                    phone: source.phone || matchingSponsor?.phone || ""
                                                }))
                                            }
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Holder..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Create New / Custom Name</SelectItem>
                                        {holderOptions.map(opt => (
                                            <SelectItem key={opt.id} value={opt.id}>
                                                {opt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Contact</Label>
                        <Input value={data.contact || ""} onChange={e => setData({ ...data, contact: e.target.value })} className="col-span-3" placeholder="Primary Contact Person" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Phone</Label>
                        <Input value={data.phone || ""} onChange={e => setData({ ...data, phone: e.target.value })} className="col-span-3" placeholder="555-0000" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Email</Label>
                        <Input value={data.email || ""} onChange={e => setData({ ...data, email: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Section</Label>
                        <Input value={data.section || ""} onChange={e => setData({ ...data, section: e.target.value })} className="col-span-3" placeholder="e.g. 101, Suite A" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Seats</Label>
                        <Input type="number" value={data.seatCount || ""} onChange={handleSeatChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Payment</Label>
                        <Select value={data.paymentMethod || "Check"} onValueChange={(val) => setData({ ...data, paymentMethod: val })}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Credit Card">Credit Card (2.9%)</SelectItem>
                                <SelectItem value="Check">Check</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Total ($)</Label>
                        <Input value={data.value || ""} onChange={e => { setData({ ...data, value: e.target.value }); setPackageType("Custom"); }} className="col-span-3 font-bold" />
                    </div>

                    {/* Breakdown Display */}
                    <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Gross Revenue (Total):</span>
                            <span className="font-medium">{data.value || "$0"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sales Tax (8.25%):</span>
                            <span className="text-red-600">-{calculateBreakdown(data.value || "0", data.paymentMethod).tax}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">CC Fees (2.9%):</span>
                            <span className="text-red-600">-{calculateBreakdown(data.value || "0", data.paymentMethod).ccFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ticket Fees:</span>
                            <span className="text-red-600">-{calculateBreakdown(data.value || "0", data.paymentMethod).ticketFee}</span>
                        </div>
                        <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                            <span>Net Revenue (You Keep):</span>
                            <span className="text-green-600">{calculateBreakdown(data.value || "0", data.paymentMethod).net}</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                        const breakdown = calculateBreakdown(data.value || "0", data.paymentMethod);
                        if (data.name) {
                            onSave({
                                ...data as SeasonTicketHolder,
                                id: existingHolder ? existingHolder.id : Math.random().toString(36).substr(2, 9),
                                name: data.name,
                                status: (data.status as any) || "Active",
                                seatCount: data.seatCount || "1",
                                year: year,
                                // Save Calculated Fields
                                subtotal: breakdown.net,
                                tax: breakdown.tax,
                                ccFee: breakdown.ccFee,
                                ticketFee: breakdown.ticketFee,
                                paymentMethod: data.paymentMethod || "Check"
                            })
                            setOpen(false)
                            if (!existingHolder) {
                                setData({ status: "Active" })
                                setPackageType("Custom")
                                setIsCustomName(false)
                            }
                        }
                    }}>Complete Sale</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function SingleGameSaleDialog({ gameId, gameName, onSave, existingSale }: { gameId: string, gameName: string, onSave: (sale: SingleGameSale) => void, existingSale?: SingleGameSale }) {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<Partial<SingleGameSale>>(existingSale || { quantity: 1, status: "Paid", paymentMethod: "Card" }) // Default card

    // Helper to calc breakdown based on Total Input
    const calculateBreakdown = (totalStr: string, method?: string) => {
        const total = parseFloat(totalStr.replace(/[^0-9.]/g, '') || "0");
        const baseRevenue = total / 1.0825;
        const tax = total - baseRevenue;
        const isCard = method === "Credit Card";
        const ccFee = isCard ? total * 0.029 : 0;
        const ticketFee = 0.99; // Flat fee per transaction or per ticket? User prompt led to total ticket fees $0.99. Assuming transaction fee.
        const net = total - tax - ccFee - ticketFee;
        const fmt = (n: number) => `$${n.toFixed(2)}`;
        return { tax: fmt(tax), ccFee: fmt(ccFee), ticketFee: fmt(ticketFee), net: fmt(net) }
    }

    const handleSubmit = () => {
        if (data.customer) {
            const breakdown = calculateBreakdown(data.price || "0", data.paymentMethod);
            onSave({
                id: existingSale ? existingSale.id : Math.random().toString(36).substr(2, 9),
                gameId: gameId,
                customer: data.customer,
                quantity: data.quantity || 1,
                section: data.section || "GA",
                price: data.price || "$0", // Grand Total
                fees: breakdown.ticketFee, // Legacy or display
                status: (data.status as any) || "Paid",
                // New Fields
                subtotal: breakdown.net,
                tax: breakdown.tax,
                ccFee: breakdown.ccFee,
                ticketFee: breakdown.ticketFee,
                paymentMethod: data.paymentMethod || "Credit Card"
            })
            setOpen(false)
            if (!existingSale) {
                setData({ quantity: 1, status: "Paid" })
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {existingSale ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Edit</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                    </Button>
                ) : (
                    <Button size="sm" variant="outline">Sell Tickets</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{existingSale ? 'Edit Sale' : 'Sell Tickets'} - {gameName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Customer</Label>
                        <Input value={data.customer || ""} onChange={e => setData({ ...data, customer: e.target.value })} className="col-span-3" placeholder="Name or Walk-up" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Qty</Label>
                        <Input type="number" value={data.quantity} onChange={e => setData({ ...data, quantity: parseInt(e.target.value) })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Section</Label>
                        <Input value={data.section || ""} onChange={e => setData({ ...data, section: e.target.value })} className="col-span-3" placeholder="e.g. 105 or GA" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Payment</Label>
                        <Select value={data.paymentMethod || "Credit Card"} onValueChange={(val) => setData({ ...data, paymentMethod: val })}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Credit Card">Credit Card (2.9%)</SelectItem>
                                <SelectItem value="Check">Check</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">Total ($)</Label>
                        <Input value={data.price || ""} onChange={e => setData({ ...data, price: e.target.value })} className="col-span-3 font-bold" />
                    </div>

                    {/* Breakdown Display */}
                    <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Gross Revenue (Total):</span>
                            <span className="font-medium">{data.price || "$0"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Sales Tax (8.25%):</span>
                            <span className="text-red-600">-{calculateBreakdown(data.price || "0", data.paymentMethod).tax}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">CC Fees (2.9%):</span>
                            <span className="text-red-600">-{calculateBreakdown(data.price || "0", data.paymentMethod).ccFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ticket Fees:</span>
                            <span className="text-red-600">-{calculateBreakdown(data.price || "0", data.paymentMethod).ticketFee}</span>
                        </div>
                        <div className="border-t pt-1 mt-1 flex justify-between font-bold">
                            <span>Net Revenue (You Keep):</span>
                            <span className="text-green-600">{calculateBreakdown(data.price || "0", data.paymentMethod).net}</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>{existingSale ? 'Save Changes' : 'Process Sale'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
