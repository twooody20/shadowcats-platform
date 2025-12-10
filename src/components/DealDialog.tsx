"use client"

import { Deal, useData } from "@/lib/store"
import { useState, useEffect } from "react"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface DealDialogProps {
    deal?: Deal | null
    initialData?: Partial<Deal>
    onSave: (deal: Partial<Deal>) => void
}

export function DealDialog({ deal, initialData, onSave }: DealDialogProps) {
    const { sponsors, inventory, deals } = useData()
    const [formData, setFormData] = useState<Partial<Deal>>({
        assets: [],
        ...initialData,
        ...deal,
        // Ensure assets is array even if deal has it as undefined
        ...(deal?.assets ? { assets: deal.assets } : {})
    })
    const [feePercent, setFeePercent] = useState("")

    useEffect(() => {
        if (deal) {
            setFormData({ ...deal, assets: deal.assets || [] })
        } else if (initialData) {
            setFormData({ assets: [], ...initialData })
        } else {
            setFormData({ assets: [] })
        }
    }, [deal, initialData])

    // Helper to parse currency
    const parseCurrency = (val: string) => parseInt(val?.replace(/[^0-9]/g, '') || "0")

    // Check availability
    const isAssetSold = (assetName: string) => {
        return deals.some(d =>
            d.status === 'Signed' &&
            d.id !== deal?.id &&
            (d.assets || []).includes(assetName)
        )
    }

    // Auto-calc budget when assets change
    useEffect(() => {
        if (formData.assets && Array.isArray(formData.assets)) {
            const total = formData.assets.reduce((sum, name) => {
                const item = inventory.find(i => i.name === name)
                return sum + parseCurrency(item?.value || "$0")
            }, 0)
            // Only update budget if it looks like we're editing assets or it's new
            // For now, always update budget to match list price of selected assets is reasonable
            setFormData(prev => ({ ...prev, budget: `$${total.toLocaleString()}` }))
        }
    }, [formData.assets, inventory])

    // Auto-calc processing fee
    useEffect(() => {
        const amount = parseCurrency(formData.actualValue || "0")
        const percent = parseFloat(feePercent || "0")

        if (percent > 0) {
            const fee = Math.round(amount * (percent / 100))
            setFormData(prev => ({ ...prev, processingFee: `$${fee.toLocaleString()}` }))
        } else if (formData.paymentMethod === 'Credit Card') {
            const fee = (amount * 0.029) + 0.30
            // Always show 2 decimal places for CC fees
            setFormData(prev => ({ ...prev, processingFee: `$${fee.toFixed(2)}` }))
        } else {
            // Reset to 0 if not CC and no manual percent override
            setFormData(prev => ({ ...prev, processingFee: "$0" }))
        }
    }, [formData.actualValue, feePercent, formData.paymentMethod])

    const toggleAsset = (name: string) => {
        const current = formData.assets || []
        if (current.includes(name)) {
            setFormData({ ...formData, assets: current.filter(a => a !== name) })
        } else {
            setFormData({ ...formData, assets: [...current, name] })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{deal ? 'Edit Contract' : 'New Contract'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Sponsor</Label>
                        <Select value={formData.sponsor} onValueChange={v => setFormData({ ...formData, sponsor: v })}>
                            <SelectTrigger><SelectValue placeholder="Select Sponsor" /></SelectTrigger>
                            <SelectContent>
                                {sponsors.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Assets</Label>
                        <div className="border rounded-md p-3 h-[150px] overflow-y-auto space-y-2">
                            {inventory.map(i => {
                                const sold = isAssetSold(i.name)
                                const selected = formData.assets?.includes(i.name)
                                return (
                                    <div key={i.id} className={`flex items-center space-x-2 ${sold && !selected ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            id={`asset-${i.id}`}
                                            checked={selected || false}
                                            disabled={sold && !selected}
                                            onChange={() => toggleAsset(i.name)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor={`asset-${i.id}`} className="flex-1 cursor-pointer font-normal">
                                            {i.name} <span className="text-muted-foreground text-xs ml-1">({i.value})</span>
                                            {sold && <span className="text-red-500 text-xs ml-2">(Sold)</span>}
                                        </Label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label>List Price (Budget)</Label>
                        <Input value={formData.budget || ""} disabled className="bg-muted" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Signed Amount</Label>
                        <Input value={formData.actualValue || ""} onChange={e => setFormData({ ...formData, actualValue: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Fee %</Label>
                        <Input
                            type="number"
                            value={feePercent}
                            onChange={e => setFeePercent(e.target.value)}
                            placeholder="%"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Processing Fee</Label>
                        <Input value={formData.processingFee || ""} onChange={e => setFormData({ ...formData, processingFee: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Signed">Signed</SelectItem>
                                <SelectItem value="Negotiating">Negotiating</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Start Date</Label>
                        <Input type="date" value={formData.start || ""} onChange={e => setFormData({ ...formData, start: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label>End Date</Label>
                        <Input type="date" value={formData.end || ""} onChange={e => setFormData({ ...formData, end: e.target.value })} />
                    </div>
                </div>

                <div className="border-t pt-4 mt-2">
                    <Label className="mb-2 block font-semibold">Payment Details</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Method</Label>
                            <Select value={formData.paymentMethod} onValueChange={(v: any) => setFormData({ ...formData, paymentMethod: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Method" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Check">Check</SelectItem>
                                    <SelectItem value="Wire">Wire Transfer</SelectItem>
                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Payment Status</Label>
                            <Select value={formData.paymentStatus} onValueChange={(v: any) => setFormData({ ...formData, paymentStatus: v })}>
                                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>External Invoice ID</Label>
                            <Input value={formData.invoiceId || ""} onChange={e => setFormData({ ...formData, invoiceId: e.target.value })} placeholder="#000000" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Fulfillment Fee</Label>
                            <Input value={formData.fulfillmentFee || ""} onChange={e => setFormData({ ...formData, fulfillmentFee: e.target.value })} placeholder="$0.00" />
                        </div>
                    </div>
                </div>

                <DialogFooter><Button type="submit">Save Contract</Button></DialogFooter>
            </form>
        </DialogContent>
    )
}
