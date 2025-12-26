"use client"

import { InventoryGrid } from "@/components/InventoryGrid"
import { InventorySummary } from "@/components/InventorySummary"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useData } from "@/lib/store"

export default function SponsorshipsPage() {
    const { addInventory, categories } = useData()
    const [open, setOpen] = useState(false)
    const [newItem, setNewItem] = useState({ name: "", category: "Signage", value: "", status: "available", sponsor: "-" })

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        addInventory({
            id: Math.random().toString(36).substr(2, 9),
            ...newItem
        } as any)
        setOpen(false)
        setNewItem({ name: "", category: "Signage", value: "", status: "available", sponsor: "-" })
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Sponsorship Management</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>New Inventory</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Inventory</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Category</Label>
                                <div className="col-span-3">
                                    <Select
                                        value={newItem.category}
                                        onValueChange={(value: any) => setNewItem({ ...newItem, category: value })}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="value" className="text-right">Value</Label>
                                <Input
                                    id="value"
                                    value={newItem.value}
                                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <div className="col-span-3">
                                    <Select
                                        value={newItem.status}
                                        onValueChange={(value: any) => setNewItem({ ...newItem, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Inventory</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <InventorySummary />
        </div>
    )
}
