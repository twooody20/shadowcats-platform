"use client"

import { useData, Deal } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock, DollarSign, Wallet, Plus, Calendar, Trash2, Edit2, Copy } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DealDialog } from "@/components/DealDialog"
import Link from "next/link"

export function InventorySummary() {
    const { inventory, deals, categories, addCategory, updateDeal, addDeal, deleteDeal, updateInventory, deleteInventory, addInventory, updateCategory } = useData()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isAddingCat, setIsAddingCat] = useState(false)
    const [newCatName, setNewCatName] = useState("")
    const [selectedYear, setSelectedYear] = useState<string>("2026")
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null) // For editing deal from drilldown

    // Range generator for future proofing
    const years = ["2026", "2027", "2028", "2029", "2030"]

    // Helper to parse currency
    const parseCurrency = (val: string) => parseFloat(val?.replace(/[^0-9.]/g, '') || "0")
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)

    // Helper: is deal active in selected year
    const isDealActiveInYear = (deal: Deal, year: string) => {
        if (!deal.start || !deal.end) return false
        const startYear = parseInt(deal.start.split('-')[0])
        const endYear = parseInt(deal.end.split('-')[0])
        const target = parseInt(year)
        // Check for overlap: Deal starts before or in target year AND Deal ends after or in target year
        return startYear <= target && endYear >= target
    }

    // Filter Deals by Year and Active Assets
    const yearDeals = deals.filter(d => isDealActiveInYear(d, selectedYear))
    const signedYearDeals = yearDeals.filter(d => d.status === 'Signed' && inventory.some(i => (d.assets || []).includes(i.name)))

    // Calculations based on YEAR
    const totalBudget = inventory.reduce((acc, item) => acc + parseCurrency(item.value), 0)
    const totalActual = signedYearDeals.reduce((acc, d) => acc + parseCurrency(d.actualValue), 0)
    const totalFees = signedYearDeals.reduce((acc, d) => acc + parseCurrency(d.processingFee || "$0") + parseCurrency(d.fulfillmentFee || "$0"), 0)
    const totalNet = totalActual - totalFees
    const totalVariance = totalNet - totalBudget

    const totalPaid = signedYearDeals.filter(d => d.paymentStatus === 'Paid').reduce((acc, d) => {
        const gross = parseCurrency(d.actualValue)
        const fees = parseCurrency(d.processingFee || "$0") + parseCurrency(d.fulfillmentFee || "$0")
        return acc + (gross - fees)
    }, 0)
    const totalPendingPayment = signedYearDeals.filter(d => d.paymentStatus === 'Pending').reduce((acc, d) => acc + parseCurrency(d.actualValue), 0)

    const totalNegotiating = yearDeals.filter(d => d.status === 'Negotiating').reduce((acc, d) => acc + parseCurrency(d.actualValue || d.budget), 0)

    // Dynamic Counts based on YEAR
    const totalItems = inventory.length
    const soldCount = inventory.filter(i => signedYearDeals.some(d => (d.assets || []).includes(i.name))).length

    // Pending count logic
    const pendingCount = inventory.filter(i => {
        const isSold = signedYearDeals.some(d => (d.assets || []).includes(i.name))
        const isPending = yearDeals.some(d => (d.assets || []).includes(i.name) && d.status === 'Negotiating')
        return !isSold && isPending
    }).length
    const availableCount = totalItems - soldCount - pendingCount

    // Category Breakdown
    const categoryStats = categories.map(cat => {
        const catItems = inventory.filter(i => i.category === cat)
        const catBudget = catItems.reduce((acc, i) => acc + parseCurrency(i.value), 0)

        // Find deals for these items active in year
        const catDeals = signedYearDeals.filter(d => catItems.some(i => (d.assets || []).includes(i.name)))
        const catActual = catDeals.reduce((acc, d) => acc + parseCurrency(d.actualValue), 0)
        const catFees = catDeals.reduce((acc, d) => isDealActiveInYear(d, selectedYear) ? acc + parseCurrency(d.processingFee || "$0") + parseCurrency(d.fulfillmentFee || "$0") : acc, 0)
        const catNet = catActual - catFees

        // Dynamic Counts per category
        const catTotal = catItems.length
        const catSold = catItems.filter(i => signedYearDeals.some(d => (d.assets || []).includes(i.name))).length
        const catPending = catItems.filter(i => {
            const isSold = signedYearDeals.some(d => (d.assets || []).includes(i.name))
            const isPending = yearDeals.some(d => (d.assets || []).includes(i.name) && d.status === 'Negotiating')
            return !isSold && isPending
        }).length
        const catAvailable = catTotal - catSold - catPending

        // For drill down, show ALL deals involved (Signed or Negotiating)
        const allCatDeals = yearDeals.filter(d => catItems.some(i => (d.assets || []).includes(i.name)))

        // Calculate negotiating for category (optional, but good for completeness if needed later)
        const negotiatingValue = allCatDeals.filter(d => d.status === 'Negotiating').reduce((acc, d) => acc + parseCurrency(d.actualValue || d.budget), 0)

        return {
            name: cat,
            budget: catBudget,
            actual: catActual,
            fees: catFees,
            net: catNet,
            diff: catNet - catBudget,
            total: catTotal,
            sold: catSold,
            pending: catPending,
            available: catAvailable,
            negotiatingValue,
            deals: allCatDeals
        }
    })

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (newCatName) {
            addCategory(newCatName)
            setIsAddingCat(false)
            setNewCatName("")
        }
    }

    return (
        <div className="space-y-6">
            {/* Year Selector */}
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Planning Year:</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px] h-8">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div >

            {/* Top Level Stats */}
            < div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6" >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Inventory Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gross Contracted</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Signed Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Contracted</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalNegotiating)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pipeline Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Processing & Fulfillment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-baseline">
                            <div className="text-2xl font-bold">{formatCurrency(totalNet)}</div>
                            <div className={`text-sm font-semibold ${totalVariance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)} vs Budget
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Target: {formatCurrency(totalBudget)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cash Collected</p>
                    </CardContent>
                </Card>
            </div >

            {/* Category Breakdown Table */}
            < Card >
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Performance by Category</CardTitle>
                    <Dialog open={isAddingCat} onOpenChange={setIsAddingCat}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddCategory} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} className="col-span-3" placeholder="Sortable Category Name" />
                                </div>
                                <DialogFooter><Button type="submit">Create Category</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Total</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Sold / Neg</th>
                                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Open</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Budget</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Pending</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Gross</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Fees</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Net</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Diff</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {categoryStats.map((cat) => (
                                    <tr key={cat.name} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{cat.name}</td>
                                        <td className="p-4 align-middle text-center">{cat.total}</td>
                                        <td className="p-4 align-middle text-center text-green-600 font-semibold">{cat.sold} / {cat.pending}</td>
                                        <td className="p-4 align-middle text-center text-gray-500">{cat.available}</td>
                                        <td className="p-4 align-middle text-right">{formatCurrency(cat.budget)}</td>
                                        <td className="p-4 align-middle text-right text-yellow-600">{formatCurrency(cat.negotiatingValue)}</td>
                                        <td className="p-4 align-middle text-right font-bold">{formatCurrency(cat.actual)}</td>
                                        <td className="p-4 align-middle text-right text-red-500">{formatCurrency(cat.fees)}</td>
                                        <td className="p-4 align-middle text-right font-bold text-green-600">{formatCurrency(cat.net)}</td>
                                        <td className={`p-4 align-middle text-right font-semibold ${cat.diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {cat.diff >= 0 ? '+' : ''}{formatCurrency(cat.diff)}
                                        </td>
                                        <td className="p-4 align-middle text-right flex items-center justify-end gap-2">
                                            <EditCategoryDialog name={cat.name} onSave={updateCategory} />
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(cat.name)}>Details</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card >

            {/* Drilldown Dialog */}
            < Dialog open={!!selectedCategory
            } onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader className="flex flex-row items-center justify-between pr-8">
                        <DialogTitle>{selectedCategory} - Management</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="contracts" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="contracts">Active Contracts ({selectedYear})</TabsTrigger>
                            <TabsTrigger value="assets">Manage Assets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="contracts" className="py-4">
                            <div className="flex justify-end mb-4">
                                <Button size="sm" onClick={() => {
                                    setSelectedCategory(null)
                                    setSelectedDeal({} as Deal)
                                }}>
                                    <Plus className="h-4 w-4 mr-2" /> New Contract
                                </Button>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Sponsor</th>
                                        <th className="text-left py-2">Asset</th>
                                        <th className="text-right py-2">Budget</th>
                                        <th className="text-right py-2">Gross</th>
                                        <th className="text-right py-2">Fees</th>
                                        <th className="text-right py-2">Net Revenue</th>
                                        <th className="text-center py-2">Status</th>
                                        <th className="text-center py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.find(c => c === selectedCategory) &&
                                        categoryStats.find(cs => cs.name === selectedCategory)?.deals.map(deal => {
                                            const gross = parseCurrency(deal.actualValue);
                                            const fees = parseCurrency(deal.processingFee || "$0") + parseCurrency(deal.fulfillmentFee || "$0");
                                            const net = gross - fees;

                                            return (
                                                <tr key={deal.id} className="border-b hover:bg-muted/50">
                                                    <td className="py-2 font-medium">
                                                        <Link href="/crm" className="hover:underline text-blue-600">
                                                            {deal.sponsor}
                                                        </Link>
                                                    </td>
                                                    <td className="py-2">{(deal.assets || []).join(", ")}</td>
                                                    <td className="py-2 text-right text-muted-foreground">{deal.budget}</td>
                                                    <td className="py-2 text-right font-medium">{deal.actualValue}</td>
                                                    <td className="py-2 text-right text-red-500">{deal.processingFee || "-"}</td>
                                                    <td className="py-2 text-right font-bold text-green-600">{formatCurrency(net)}</td>
                                                    <td className="py-2 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${deal.status === 'Signed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {deal.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-center flex items-center justify-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedDeal(deal)}>Edit</Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => {
                                                            if (confirm("Are you sure you want to delete this contract? The asset will preserve its status.")) {
                                                                deleteDeal(deal.id)
                                                            }
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {(!categoryStats.find(cs => cs.name === selectedCategory)?.deals.length) && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-4 text-muted-foreground">No active contracts for this category in {selectedYear}.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </TabsContent>

                        <TabsContent value="assets" className="py-4">
                            <div className="flex justify-end mb-4">
                                <InventoryAddDialog category={selectedCategory} onSave={addInventory} />
                            </div>
                            <div className="max-h-[400px] overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-background">
                                        <tr className="border-b">
                                            <th className="text-left py-2">Asset Name</th>
                                            <th className="text-left py-2">Sponsor</th>
                                            <th className="text-right py-2">List Value</th>
                                            <th className="text-center py-2">Current Status</th>
                                            <th className="text-center py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.filter(i => i.category === selectedCategory).map(item => {
                                            // Derive status for selected year
                                            const yearDeals = deals.filter(d =>
                                                // @ts-ignore
                                                (categories || []).includes(inventory.find(inv => (d.assets || []).includes(inv.name))?.category || "") &&
                                                isDealActiveInYear(d, selectedYear)
                                            );
                                            const assetDeal = yearDeals.find(d => (d.assets || []).includes(item.name))
                                            let derivedStatus = 'available'
                                            if (assetDeal) {
                                                derivedStatus = assetDeal.status === 'Signed' ? 'sold' : 'pending'
                                            }

                                            return (
                                                <tr key={item.id} className="border-b hover:bg-muted/50">
                                                    <td className="py-2 font-medium">{item.name}</td>
                                                    <td className="py-2 text-muted-foreground">{assetDeal?.sponsor || "-"}</td>
                                                    <td className="py-2 text-right">{item.value}</td>
                                                    <td className="py-2 text-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs 
                                                            ${derivedStatus === 'sold' ? 'bg-green-100 text-green-800' :
                                                                derivedStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                            {derivedStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-center flex items-center justify-center gap-2">
                                                        {assetDeal && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-blue-600 hover:text-blue-800"
                                                                onClick={() => setSelectedDeal(assetDeal)}
                                                                title="Edit Contract"
                                                            >
                                                                <Wallet className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            onClick={() => addInventory({
                                                                ...item,
                                                                id: Math.random().toString(36).substr(2, 9),
                                                                name: `${item.name} (Copy)`,
                                                                status: 'available',
                                                                sponsor: '-'
                                                            })}
                                                            title="Duplicate Asset"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <InventoryEditDialog item={item} onSave={updateInventory} />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => {
                                                            if (confirm("Are you sure you want to delete this asset? This may affect historical data.")) {
                                                                deleteInventory(item.id)
                                                            }
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {inventory.filter(i => i.category === selectedCategory).length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-muted-foreground">No assets found in this category.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog >

            {/* Edit/New Deal Modal from Drilldown */}
            <Dialog open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
                <DealDialog deal={selectedDeal?.id ? selectedDeal : null} onSave={(d) => {
                    if (selectedDeal?.id) {
                        // Update existing
                        updateDeal(selectedDeal.id, d)
                    } else {
                        // Create new
                        if (d.sponsor && d.assets?.length) {
                            addDeal({
                                id: `DL-${Math.floor(Math.random() * 1000)}`,
                                status: "Negotiating",
                                budget: d.budget || "$0",
                                actualValue: d.actualValue || "$0",
                                paymentMethod: d.paymentMethod || "Check",
                                paymentStatus: "Pending",
                                ...d
                            } as Deal)
                        }
                    }
                    setSelectedDeal(null)
                }} />
            </Dialog >

        </div >
    )
}

function InventoryEditDialog({ item, onSave }: { item: any, onSave: any }) {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState({ name: item.name, value: item.value })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Edit2 className="h-3 w-3" /></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Asset</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Name</Label>
                        <Input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">List Value</Label>
                        <Input value={data.value} onChange={e => setData({ ...data, value: e.target.value })} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                        onSave(item.id, data)
                        setOpen(false)
                    }}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function InventoryAddDialog({ category, onSave }: { category: string | null, onSave: any }) {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState({ name: "", value: "" })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Asset</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Name</Label>
                        <Input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">List Value</Label>
                        <Input value={data.value} onChange={e => setData({ ...data, value: e.target.value })} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                        onSave({
                            id: Math.random().toString(36).substr(2, 9),
                            name: data.name,
                            category: category,
                            status: "available",
                            sponsor: "-",
                            value: data.value
                        })
                        setOpen(false)
                        setData({ name: "", value: "" })
                    }}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function EditCategoryDialog({ name, onSave }: { name: string, onSave: (old: string, newName: string) => void }) {
    const [open, setOpen] = useState(false)
    const [newName, setNewName] = useState(name)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Edit2 className="h-3 w-3" /></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Name</Label>
                        <Input value={newName} onChange={e => setNewName(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                        onSave(name, newName)
                        setOpen(false)
                    }}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
