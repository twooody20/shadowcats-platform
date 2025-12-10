"use client"

import { Player, useData } from "@/lib/store"
import { useState, useEffect } from "react"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface PlayerDialogProps {
    player?: Player | null
    onSave: (player: Partial<Player>) => void
}

export function PlayerDialog({ player, onSave }: PlayerDialogProps) {
    const defaultState: Partial<Player> = {
        seasonType: 'Full Season',
        paymentType: 'Full Payment',
        paymentMethod: 'Check',
        status: 'Active',
        notes: ''
    }

    const [formData, setFormData] = useState<Partial<Player>>(player || defaultState)

    // Reset when dialog opens/closes
    useEffect(() => {
        if (player) {
            setFormData(player)
        } else {
            setFormData(defaultState)
        }
    }, [player])

    // Calculates Prices & Fees
    useEffect(() => {
        const seasonPrice = formData.seasonType === 'Half Season' ? 208 : 516
        const isDeposit = formData.paymentType === 'Deposit'
        const isPayBalance = formData.paymentType === 'Pay Balance'

        // Helper to parse existing values from the *original* player record passed in props
        // We use 'player' prop not 'formData' for original state because formData updates as we type
        const parse = (val: string | undefined) => parseFloat(val?.replace(/[^0-9.]/g, '') || "0")
        const originalPaid = player ? parse(player.paidAmount) : 0
        const originalFees = player ? parse(player.fees) : 0

        let basePayment = seasonPrice
        if (isDeposit) basePayment = 155
        if (isPayBalance) basePayment = seasonPrice - originalPaid

        let fee = 0
        if (formData.paymentMethod === 'Credit Card') {
            fee = (basePayment * 0.029) + 0.30
        }

        // Create display values
        // If Pay Balance, we are updating the record to show FULLY PAID.
        // Fees should accumulate? If I paid deposit with check ($0 fee) then balance with CC ($10 fee), total fee is $10.
        // If I paid deposit with CC ($5) then balance with CC ($10), total fee is $15.
        // So yes, if Pay Balance, add to original fees. 
        // IF we are just editing the original "Deposit" transaction, we shouldn't add.
        // But "Pay Balance" implies a new derived state.

        const totalFees = (isPayBalance ? originalFees : 0) + fee

        const totalPaidSoFar = isPayBalance ? (originalPaid + basePayment) : basePayment
        const remainder = seasonPrice - totalPaidSoFar

        setFormData(prev => ({
            ...prev,
            amountDue: `$${seasonPrice}`,
            fees: totalFees > 0 ? `$${totalFees.toFixed(2)}` : '$0',
            paidAmount: `$${totalPaidSoFar}`,
            balance: `$${remainder}`,
        }))

    }, [formData.seasonType, formData.paymentType, formData.paymentMethod, player])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>{player ? 'Edit Player' : 'Register Player'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Player Name</Label>
                    <Input value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 555-5555" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="grid gap-2">
                        <Label>Season Type</Label>
                        <Select value={formData.seasonType} onValueChange={(v: any) => setFormData({ ...formData, seasonType: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full Season">Full Season ($516)</SelectItem>
                                <SelectItem value="Half Season">Half Season ($208)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Payment Type</Label>
                        <Select value={formData.paymentType} onValueChange={(v: any) => setFormData({ ...formData, paymentType: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full Payment">Full Payment</SelectItem>
                                <SelectItem value="Deposit">Deposit ($155)</SelectItem>
                                <SelectItem value="Pay Balance">Pay Balance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Payment Method</Label>
                        <Select value={formData.paymentMethod} onValueChange={(v: any) => setFormData({ ...formData, paymentMethod: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Check">Check</SelectItem>
                                <SelectItem value="Credit Card">Credit Card</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Season Price:</span>
                        <span className="font-medium">{formData.amountDue}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Amount:</span>
                        <span className="font-medium">{formData.paidAmount}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                        <span>CC Processing Fee:</span>
                        <span>{formData.fees}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Remaining Balance:</span>
                        <span>{formData.balance}</span>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Square Link</Label>
                    <Input value={formData.paymentLink || ""} onChange={e => setFormData({ ...formData, paymentLink: e.target.value })} placeholder="https://square.link/..." />
                </div>
                <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <DialogFooter>
                    <Button type="submit">Save Registration</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}
