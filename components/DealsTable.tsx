"use client"

import { useData, Deal } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"
import { DealDialog } from "./DealDialog"

export function DealsTable() {
    const { deals, updateDeal, addDeal } = useData()
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
    const [isAdding, setIsAdding] = useState(false)

    const handleSaveEdit = (updated: Partial<Deal>) => {
        if (editingDeal) {
            updateDeal(editingDeal.id, updated)
            setEditingDeal(null)
        }
    }

    const handleAdd = (newDeal: Partial<Deal>) => {
        if (newDeal.sponsor && newDeal.assets) {
            addDeal({
                id: `DL-${Math.floor(Math.random() * 1000)}`,
                status: "Negotiating",
                budget: newDeal.budget || "$0",
                actualValue: newDeal.actualValue || "$0",
                paymentMethod: newDeal.paymentMethod || "Check",
                paymentStatus: "Pending",
                ...newDeal
            } as Deal)
            setIsAdding(false)
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h3 className="font-semibold leading-none tracking-tight">Contract Details</h3>
                    <p className="text-sm text-muted-foreground">Active and pending agreements</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">New Contract</Button>
                    </DialogTrigger>
                    <DealDialog onSave={handleAdd} />
                </Dialog>
            </div>
            <div className="relative w-full overflow-auto max-h-[400px]">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b sticky top-0 bg-card z-10">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Deal ID</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sponsor</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Asset</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Term</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Budget / Actual</th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Payment</th>
                            <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map((deal) => (
                            <tr key={deal.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">{deal.id}</td>
                                <td className="p-4 align-middle">{deal.sponsor}</td>
                                <td className="p-4 align-middle">{deal.assets?.join(", ")}</td>
                                <td className="p-4 align-middle text-xs text-muted-foreground">
                                    <div>{deal.start}</div>
                                    <div>{deal.end}</div>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    <div className="text-xs text-muted-foreground line-through">{deal.budget}</div>
                                    <div className="font-bold">{deal.actualValue}</div>
                                </td>
                                <td className="p-4 align-middle text-right">
                                    <div className="text-sm">{deal.paymentMethod}</div>
                                    <div className={`text-xs ${deal.paymentStatus === 'Paid' ? 'text-green-600 font-bold' : 'text-yellow-600'}`}>
                                        {deal.paymentStatus}
                                    </div>
                                    {deal.processingFee && <div className="text-xs text-red-500">Fee: {deal.processingFee}</div>}
                                </td>
                                <td className="p-4 align-middle text-center">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                        ${deal.status === 'Signed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {deal.status}
                                    </span>
                                </td>
                                <td className="p-4 align-middle text-center">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingDeal(deal)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={!!editingDeal} onOpenChange={(open) => !open && setEditingDeal(null)}>
                <DealDialog deal={editingDeal} onSave={handleSaveEdit} />
            </Dialog>
        </div>
    )
}
