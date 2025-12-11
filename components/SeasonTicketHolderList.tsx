"use client"

import { useData, SeasonTicketHolder } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Plus, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export function SeasonTicketHolderList() {
    const { seasonTicketHolders, addSeasonTicketHolder, updateSeasonTicketHolder } = useData()
    const [editingHolder, setEditingHolder] = useState<SeasonTicketHolder | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newHolder, setNewHolder] = useState<Partial<SeasonTicketHolder>>({ status: 'Active' })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingHolder) {
            updateSeasonTicketHolder(editingHolder.id, editingHolder)
            setEditingHolder(null)
        }
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (newHolder.name) {
            addSeasonTicketHolder({
                id: Math.random().toString(36).substr(2, 9),
                status: 'Active',
                section: '-',
                seatCount: '1',
                value: '$0',
                ...newHolder
            } as SeasonTicketHolder)
            setIsAdding(false)
            setNewHolder({ status: 'Active' })
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h3 className="font-semibold leading-none tracking-tight">Season Ticket Holders</h3>
                    <p className="text-sm text-muted-foreground">Manage relationships and renewals</p>
                    <Link href="/tickets" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                        Manage in Tickets Dashboard <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Holder
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader><DialogTitle>New Season Ticket Holder</DialogTitle></DialogHeader>
                        <form onSubmit={handleAdd} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input value={newHolder.name || ""} onChange={e => setNewHolder({ ...newHolder, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Contact</Label>
                                <Input value={newHolder.contact || ""} onChange={e => setNewHolder({ ...newHolder, contact: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Phone</Label>
                                <Input value={newHolder.phone || ""} onChange={e => setNewHolder({ ...newHolder, phone: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Email</Label>
                                <Input value={newHolder.email || ""} onChange={e => setNewHolder({ ...newHolder, email: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Section</Label>
                                <Input value={newHolder.section || ""} onChange={e => setNewHolder({ ...newHolder, section: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Seats</Label>
                                <Input value={newHolder.seatCount || ""} onChange={e => setNewHolder({ ...newHolder, seatCount: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Value</Label>
                                <Input value={newHolder.value || ""} onChange={e => setNewHolder({ ...newHolder, value: e.target.value })} className="col-span-3" />
                            </div>
                            <DialogFooter><Button type="submit">Add Holder</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-6 pt-0">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contact</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Section</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Seats</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Value</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {seasonTicketHolders.map((holder) => (
                                <tr key={holder.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">{holder.name}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span>{holder.contact}</span>
                                            <span className="text-xs text-muted-foreground">{holder.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">{holder.phone}</td>
                                    <td className="p-4 align-middle">{holder.section}</td>
                                    <td className="p-4 align-middle">{holder.seatCount}</td>
                                    <td className="p-4 align-middle">{holder.value}</td>
                                    <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                            ${holder.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                holder.status === 'Renewal Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {holder.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingHolder(holder)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!editingHolder} onOpenChange={(open) => !open && setEditingHolder(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Holder</DialogTitle></DialogHeader>
                    {editingHolder && (
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Name</Label>
                                <Input value={editingHolder.name} onChange={e => setEditingHolder({ ...editingHolder, name: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Contact</Label>
                                <Input value={editingHolder.contact} onChange={e => setEditingHolder({ ...editingHolder, contact: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Phone</Label>
                                <Input value={editingHolder.phone || ""} onChange={e => setEditingHolder({ ...editingHolder, phone: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Email</Label>
                                <Input value={editingHolder.email} onChange={e => setEditingHolder({ ...editingHolder, email: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Section</Label>
                                <Input value={editingHolder.section} onChange={e => setEditingHolder({ ...editingHolder, section: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Value</Label>
                                <Input value={editingHolder.value} onChange={e => setEditingHolder({ ...editingHolder, value: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Status</Label>
                                <div className="col-span-3">
                                    <Select value={editingHolder.status} onValueChange={(val: any) => setEditingHolder({ ...editingHolder, status: val })}>
                                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Renewal Pending">Renewal Pending</SelectItem>
                                            <SelectItem value="Past">Past</SelectItem>
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
