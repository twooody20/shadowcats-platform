"use client"

import { useData, Sponsor } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Search, ArrowUpDown, Trash2 } from "lucide-react"

export function SponsorList() {
    const { sponsors, updateSponsor, addSponsor, deleteSponsor, deals, inventory } = useData()
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newSponsor, setNewSponsor] = useState<Partial<Sponsor>>({})
    const [searchText, setSearchText] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

    // Helper to parse currency
    const parseCurrency = (val: string) => parseInt(val?.replace(/[^0-9]/g, '') || "0")
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

    // Calculate dynamic value
    const getSponsorValue = (sponsorId: string) => {
        const sponsorDeals = deals.filter(d =>
            d.sponsor === sponsors.find(s => s.id === sponsorId)?.name &&
            d.status === 'Signed'
        );
        const total = sponsorDeals.reduce((acc, d) => acc + parseCurrency(d.actualValue), 0);
        return total;
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingSponsor) {
            updateSponsor(editingSponsor.id, editingSponsor)
            setEditingSponsor(null)
        }
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (newSponsor.name) {
            addSponsor({
                id: Math.random().toString(36).substr(2, 9),
                status: "Active",
                phone: "",
                ...newSponsor
            } as Sponsor)
            setIsAdding(false)
            setNewSponsor({})
        }
    }

    const sortData = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }

    const filteredSponsors = sponsors
        .map(s => ({ ...s, derivedValue: getSponsorValue(s.id) }))
        .filter(s =>
            s.name.toLowerCase().includes(searchText.toLowerCase()) ||
            s.contact.toLowerCase().includes(searchText.toLowerCase()) ||
            s.email.toLowerCase().includes(searchText.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortConfig) return 0;
            // @ts-ignore
            const aValue = a[sortConfig.key] || "";
            // @ts-ignore
            const bValue = b[sortConfig.key] || "";
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });


    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-6">
                <div>
                    <h3 className="font-semibold leading-none tracking-tight">Active Sponsors</h3>
                    <p className="text-sm text-muted-foreground">Manage your relationships</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search sponsors..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-8 h-9 w-[200px]"
                        />
                    </div>
                    <Dialog open={isAdding} onOpenChange={setIsAdding}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Add Sponsor</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Sponsor</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <Input value={newSponsor.name || ""} onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Contact</Label>
                                    <Input value={newSponsor.contact || ""} onChange={e => setNewSponsor({ ...newSponsor, contact: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Phone</Label>
                                    <Input value={newSponsor.phone || ""} onChange={e => setNewSponsor({ ...newSponsor, phone: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Email</Label>
                                    <Input value={newSponsor.email || ""} onChange={e => setNewSponsor({ ...newSponsor, email: e.target.value })} className="col-span-3" />
                                </div>
                                <DialogFooter><Button type="submit">Add</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="relative w-full overflow-auto max-h-[400px]">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b sticky top-0 bg-card z-10">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => sortData('name')}>
                                Company <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => sortData('contact')}>
                                Contact <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => sortData('email')}>
                                Email <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => sortData('status')}>
                                Status <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => sortData('derivedValue')}>
                                Total Value <ArrowUpDown className="inline h-3 w-3 ml-1" />
                            </th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {filteredSponsors.map((sponsor) => (
                            <tr key={sponsor.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <td className="p-4 align-middle font-medium">{sponsor.name}</td>
                                <td className="p-4 align-middle">{sponsor.contact}</td>
                                <td className="p-4 align-middle">{sponsor.phone}</td>
                                <td className="p-4 align-middle">{sponsor.email}</td>
                                <td className="p-4 align-middle">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                    ${sponsor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {sponsor.status}
                                    </span>
                                </td>
                                <td className="p-4 align-middle text-right">{formatCurrency(sponsor.derivedValue)}</td>
                                <td className="p-4 align-middle text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingSponsor(sponsor)} className="mr-1">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteSponsor(sponsor.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={!!editingSponsor} onOpenChange={(open) => !open && setEditingSponsor(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Sponsor</DialogTitle>
                    </DialogHeader>
                    {editingSponsor && (
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="s-name" className="text-right">Name</Label>
                                <Input
                                    id="s-name"
                                    value={editingSponsor.name}
                                    onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="s-contact" className="text-right">Contact</Label>
                                <Input
                                    id="s-contact"
                                    value={editingSponsor.contact}
                                    onChange={(e) => setEditingSponsor({ ...editingSponsor, contact: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="s-phone" className="text-right">Phone</Label>
                                <Input
                                    id="s-phone"
                                    value={editingSponsor.phone || ""}
                                    onChange={(e) => setEditingSponsor({ ...editingSponsor, phone: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="s-email" className="text-right">Email</Label>
                                <Input
                                    id="s-email"
                                    value={editingSponsor.email}
                                    onChange={(e) => setEditingSponsor({ ...editingSponsor, email: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="s-status" className="text-right">Status</Label>
                                <div className="col-span-3">
                                    <Select
                                        value={editingSponsor.status}
                                        onValueChange={(value: any) => setEditingSponsor({ ...editingSponsor, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Negotiating">Negotiating</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

        </div >
    )
}
