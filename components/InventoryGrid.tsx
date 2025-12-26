"use client"

import { CheckCircle2, Circle, Clock, Plus, Tag, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData, InventoryItem } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InventoryGrid() {
    const { inventory, updateInventory, categories, addCategory, updateCategory } = useData()
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

    // Category Management State
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")

    const [editingCategory, setEditingCategory] = useState<string | null>(null)
    const [renamedCategoryName, setRenamedCategoryName] = useState("")

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingItem) {
            updateInventory(editingItem.id, editingItem)
            setEditingItem(null)
        }
    }

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (newCategoryName) {
            addCategory(newCategoryName)
            setNewCategoryName("")
            setIsAddingCategory(false)
        }
    }

    const handleUpdateCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingCategory && renamedCategoryName) {
            updateCategory(editingCategory, renamedCategoryName)
            setEditingCategory(null)
            setRenamedCategoryName("")
        }
    }

    // Group inventory by category
    const groupedInventory = categories.reduce((acc, category) => {
        acc[category] = inventory.filter(item => item.category === category)
        return acc
    }, {} as Record<string, InventoryItem[]>)

    // Handle items with undefined or deleted categories
    const miscItems = inventory.filter(item => !categories.includes(item.category))
    if (miscItems.length > 0) groupedInventory['Uncategorized'] = miscItems

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Tag className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
                        <form onSubmit={handleAddCategory} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="col-span-3" placeholder="e.g. Hospitality" />
                            </div>
                            <DialogFooter><Button type="submit">Create Category</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Render by Category List to maintain order and show empty sections if desired, or just those with items */}
            {categories.map(category => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold tracking-tight">{category}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingCategory(category); setRenamedCategoryName(category); }}>
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {inventory.filter(i => i.category === category).map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setEditingItem(item)}
                                className="flex cursor-pointer flex-col rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary"
                            >
                                <div className="flex items-start justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                                    {item.status === "sold" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    {item.status === "available" && <Circle className="h-4 w-4 text-gray-300" />}
                                    {item.status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
                                </div>
                                <div className="mt-2 text-xl font-bold">{item.value}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {item.status === "sold" ? `Sold to ${item.sponsor}` : item.status === "available" ? "Available" : "Negotiating"}
                                </div>
                                <div className={cn(
                                    "mt-3 h-1.5 w-full rounded-full",
                                    item.status === "sold" ? "bg-green-500" : item.status === "available" ? "bg-gray-200" : "bg-yellow-500"
                                )} />
                            </div>
                        ))}
                        {/* Placeholder for empty category? Optional. */}
                        {inventory.filter(i => i.category === category).length === 0 && (
                            <div className="col-span-full rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No inventory in this category.
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Catch-all for uncategorized items if any */}
            {inventory.some(i => !categories.includes(i.category)) && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold tracking-tight">Uncategorized</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {inventory.filter(i => !categories.includes(i.category)).map(item => (
                            <div key={item.id} onClick={() => setEditingItem(item)} className="p-4 border rounded bg-card">
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Inventory</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Category</Label>
                                <div className="col-span-3">
                                    <Select
                                        value={editingItem.category}
                                        onValueChange={(value: any) => setEditingItem({ ...editingItem, category: value })}
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
                                    value={editingItem.value}
                                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Status</Label>
                                <div className="col-span-3">
                                    <Select
                                        value={editingItem.status}
                                        onValueChange={(value: any) => setEditingItem({ ...editingItem, status: value })}
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
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sponsor" className="text-right">Sponsor</Label>
                                <Input
                                    id="sponsor"
                                    value={editingItem.sponsor}
                                    onChange={(e) => setEditingItem({ ...editingItem, sponsor: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
                    <form onSubmit={handleUpdateCategory} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <Input value={renamedCategoryName} onChange={e => setRenamedCategoryName(e.target.value)} className="col-span-3" />
                        </div>
                        <DialogFooter><Button type="submit">Save Category</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
