"use client"

import { User, Plus, Edit2 } from "lucide-react"
import { useData, Staff } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StaffAssignment() {
    const { staff, addStaff, updateStaff } = useData()
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newStaff, setNewStaff] = useState<Partial<Staff>>({})

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingStaff) {
            updateStaff(editingStaff.id, editingStaff)
            setEditingStaff(null)
        }
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (newStaff.name) {
            addStaff({
                id: Math.random().toString(36).substr(2, 9),
                status: "Active",
                role: "Staff",
                ...newStaff
            } as Staff)
            setIsAdding(false)
            setNewStaff({})
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h3 className="font-semibold leading-none tracking-tight">Staffing</h3>
                    <p className="text-sm text-muted-foreground">On-site personnel</p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Staff</DialogTitle></DialogHeader>
                        <form onSubmit={handleAdd} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input value={newStaff.name || ""} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Role</Label>
                                <Input value={newStaff.role || ""} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} className="col-span-3" />
                            </div>
                            <DialogFooter><Button type="submit">Add Staff</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-6 pt-0">
                <div className="space-y-4">
                    {staff.map((person) => (
                        <div key={person.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                                    <User className="h-4 w-4 text-secondary-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{person.name}</div>
                                    <div className="text-xs text-muted-foreground">{person.role}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                    ${['On Duty', 'Active'].includes(person.status) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {person.status}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => setEditingStaff(person)}>
                                    <Edit2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
                    {editingStaff && (
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input value={editingStaff.name} onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Role</Label>
                                <Input value={editingStaff.role} onChange={e => setEditingStaff({ ...editingStaff, role: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Status</Label>
                                <div className="col-span-3">
                                    <Select value={editingStaff.status} onValueChange={(val: any) => setEditingStaff({ ...editingStaff, status: val })}>
                                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="On Duty">On Duty</SelectItem>
                                            <SelectItem value="Break">Break</SelectItem>
                                            <SelectItem value="Off">Off</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
