"use client"

import { useData, TimelineItem } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2 } from "lucide-react"

export function GameDayPlanner() {
    const { timeline, addTimelineItem, updateTimelineItem } = useData()
    const [editingItem, setEditingItem] = useState<TimelineItem | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newItem, setNewItem] = useState<Partial<TimelineItem>>({})

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingItem) {
            updateTimelineItem(editingItem.id, editingItem)
            setEditingItem(null)
        }
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (newItem.activity) {
            addTimelineItem({
                id: Math.random().toString(36).substr(2, 9),
                status: "Pending",
                assigned: "Unassigned",
                ...newItem
            } as TimelineItem)
            setIsAdding(false)
            setNewItem({})
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h3 className="font-semibold leading-none tracking-tight">Game Day Run of Show</h3>
                    <p className="text-sm text-muted-foreground">June 12 vs. Rebels</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Timeline Item</DialogTitle></DialogHeader>
                        <form onSubmit={handleAdd} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Time</Label>
                                <Input value={newItem.time || ""} onChange={e => setNewItem({ ...newItem, time: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Activity</Label>
                                <Input value={newItem.activity || ""} onChange={e => setNewItem({ ...newItem, activity: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Assigned</Label>
                                <Input value={newItem.assigned || ""} onChange={e => setNewItem({ ...newItem, assigned: e.target.value })} className="col-span-3" />
                            </div>
                            <DialogFooter><Button type="submit">Add Item</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-6 pt-0">
                <div className="relative border-l border-muted ml-3 space-y-6">
                    {timeline.map((item, index) => (
                        <div key={item.id} className="ml-6 relative group cursor-pointer" onClick={() => setEditingItem(item)}>
                            <span className="absolute -left-[29px] mt-1.5 h-3 w-3 rounded-full border border-background bg-primary" />
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium leading-none text-primary">{item.time}</span>
                                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                </div>
                                <span className="font-semibold">{item.activity}</span>
                                <span className="text-xs text-muted-foreground">Assigned: {item.assigned}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Timeline Item</DialogTitle></DialogHeader>
                    {editingItem && (
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Time</Label>
                                <Input value={editingItem.time} onChange={e => setEditingItem({ ...editingItem, time: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Activity</Label>
                                <Input value={editingItem.activity} onChange={e => setEditingItem({ ...editingItem, activity: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Assigned</Label>
                                <Input value={editingItem.assigned} onChange={e => setEditingItem({ ...editingItem, assigned: e.target.value })} className="col-span-3" />
                            </div>
                            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
