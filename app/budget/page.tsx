"use client"

import { useState } from "react"
import { useData } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BudgetPage() {
    const {
        expenses, addExpense, updateExpense, deleteExpense,

        revenues, addRevenue, updateRevenue, deleteRevenue,
        deals, seasonTicketHolders, singleGameSales, players, inventory
    } = useData()

    const [selectedYear, setSelectedYear] = useState<string>("2026")

    // State for Revenue Dialog
    const [isRevDialogOpen, setIsRevDialogOpen] = useState(false)
    const [revEditingId, setRevEditingId] = useState<string | null>(null)
    const [revCategory, setRevCategory] = useState("")
    const [revBudget, setRevBudget] = useState("")
    const [revActual, setRevActual] = useState("")

    // State for Expense Dialog
    const [isExpDialogOpen, setIsExpDialogOpen] = useState(false)
    const [expEditingId, setExpEditingId] = useState<string | null>(null)
    const [expCategory, setExpCategory] = useState("")
    const [expBudget, setExpBudget] = useState("")
    const [expActual, setExpActual] = useState("")

    // Helper to format currency
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
    const parseCurrency = (val: string) => parseFloat(val?.replace(/[^0-9.-]/g, '') || "0")

    // --- REVENUE CALCULATIONS ---
    // 1. Sponsorships (Deals)
    const isDealActiveInYear = (deal: any, targetYear: string) => {
        if (!deal.start && !deal.end) return false
        const startYear = deal.start ? new Date(deal.start).getFullYear() : parseInt(targetYear)
        const endYear = deal.end ? new Date(deal.end).getFullYear() : parseInt(targetYear)
        const target = parseInt(targetYear)
        return target >= startYear && target <= endYear
    }
    const yearDeals = deals.filter(d => isDealActiveInYear(d, selectedYear))

    // Budget: Total Value of All Inventory (Potential Revenue)
    // Inventory items have a 'value' field (e.g., "$5,000") representing their list price/budget value.
    const totalSponsorshipBudget = inventory.reduce((sum, item) => sum + parseCurrency(item.value), 0)

    // Actual: Sum of SIGNED deals' actualValue
    const totalSponsorshipActual = yearDeals
        .filter(d => d.status === 'Signed')
        .reduce((sum, d) => sum + parseCurrency(d.actualValue), 0)

    // 2. Tickets & Players (Now Manual)
    // removed automated calculations as they are now in 'revenues' array derived manually.

    // 4. Manual Revenues (Merch, F&B)
    const yearRevenues = revenues.filter(r => r.year === selectedYear)
    const totalManualBudget = yearRevenues.reduce((sum, r) => sum + parseCurrency(r.budget), 0)
    const totalManualActual = yearRevenues.reduce((sum, r) => sum + parseCurrency(r.actual), 0)

    // Grand Totals
    // Grand Totals
    const grandTotalRevBudget = totalSponsorshipBudget + totalManualBudget
    const grandTotalRevActual = totalSponsorshipActual + totalManualActual

    // --- EXPENSE CALCULATIONS ---
    const yearExpenses = expenses.filter(e => e.year === selectedYear)
    const totalExpBudget = yearExpenses.reduce((sum, e) => sum + parseCurrency(e.budget), 0)
    const totalExpActual = yearExpenses.reduce((sum, e) => sum + parseCurrency(e.actual), 0)

    // --- NET PROFIT ---
    const netProfitActual = grandTotalRevActual - totalExpActual
    const netProfitBudget = grandTotalRevBudget - totalExpBudget


    // --- HANDLERS ---
    const handleRevSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (revEditingId) {
            updateRevenue(revEditingId, { category: revCategory, budget: revBudget, actual: revActual, year: selectedYear })
        } else {
            addRevenue({ id: Math.random().toString(36).substr(2, 9), category: revCategory, budget: revBudget, actual: revActual, year: selectedYear })
        }
        setIsRevDialogOpen(false)
        setRevCategory(""); setRevBudget(""); setRevActual(""); setRevEditingId(null)
    }

    const handleExpSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (expEditingId) {
            updateExpense(expEditingId, { category: expCategory, budget: expBudget, actual: expActual, year: selectedYear })
        } else {
            addExpense({ id: Math.random().toString(36).substr(2, 9), category: expCategory, budget: expBudget, actual: expActual, year: selectedYear })
        }
        setIsExpDialogOpen(false)
        setExpCategory(""); setExpBudget(""); setExpActual(""); setExpEditingId(null)
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Budget & Financials</h2>
                <div className="flex items-center space-x-2">
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {["2025", "2026", "2027", "2028"].map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            {/* SUMMARY CARDS */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-muted-foreground text-sm">Budget</span>
                            <span className="font-semibold">{formatCurrency(grandTotalRevBudget)}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-muted-foreground text-sm">Actual</span>
                            <span className="text-2xl font-bold">{formatCurrency(grandTotalRevActual)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                            <span>Variance</span>
                            <span className={grandTotalRevActual >= grandTotalRevBudget ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {formatCurrency(grandTotalRevActual - grandTotalRevBudget)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-muted-foreground text-sm">Budget</span>
                            <span className="font-semibold">{formatCurrency(totalExpBudget)}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-muted-foreground text-sm">Actual</span>
                            <span className="text-2xl font-bold">{formatCurrency(totalExpActual)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                            <span>Variance</span>
                            <span className={totalExpBudget - totalExpActual >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {formatCurrency(totalExpBudget - totalExpActual)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-muted-foreground text-sm">Projected</span>
                            <span className="font-semibold">{formatCurrency(netProfitBudget)}</span>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-muted-foreground text-sm">Actual</span>
                            <span className={`text-2xl font-bold ${netProfitActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(netProfitActual)}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between">
                            <span>Variance</span>
                            <span className={netProfitActual - netProfitBudget >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {formatCurrency(netProfitActual - netProfitBudget)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="revenue" className="w-full">
                <TabsList>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isRevDialogOpen} onOpenChange={setIsRevDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => { setRevEditingId(null); setRevCategory(""); setRevBudget(""); setRevActual(""); }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Revenue Item
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{revEditingId ? "Edit Revenue" : "Add Revenue"}</DialogTitle>
                                    <DialogDescription>Add manual revenue items like Merchandise or F&B.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRevSubmit}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="category" className="text-right">Category</Label>
                                            <Input id="category" value={revCategory} onChange={e => setRevCategory(e.target.value)} className="col-span-3" required />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="budget" className="text-right">Budget</Label>
                                            <Input id="budget" type="number" step="0.01" value={revBudget} onChange={e => setRevBudget(e.target.value)} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="actual" className="text-right">Actual</Label>
                                            <Input id="actual" type="number" step="0.01" value={revActual} onChange={e => setRevActual(e.target.value)} className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Budget</TableHead>
                                        <TableHead className="text-right">Actual</TableHead>
                                        <TableHead className="text-right">Variance</TableHead>
                                        <TableHead className="text-right">Type</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* Automated Rows - Only Sponsorships Left */}
                                    <TableRow>
                                        <TableCell className="font-medium">Sponsorships</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalSponsorshipBudget)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalSponsorshipActual)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalSponsorshipActual - totalSponsorshipBudget)}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">Automated</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>

                                    {/* Manual Rows */}
                                    {yearRevenues.map(r => {
                                        const b = parseCurrency(r.budget);
                                        const a = parseCurrency(r.actual);
                                        return (
                                            <TableRow key={r.id}>
                                                <TableCell className="font-medium">{r.category}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(b)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(a)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(a - b)}</TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground">Manual</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setRevCategory(r.category); setRevBudget(r.budget); setRevActual(r.actual);
                                                        setRevEditingId(r.id); setIsRevDialogOpen(true);
                                                    }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteRevenue(r.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                    {/* Same Expenses Table Logic as Before */}
                    <div className="flex justify-end">
                        <Dialog open={isExpDialogOpen} onOpenChange={setIsExpDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => { setExpEditingId(null); setExpCategory(""); setExpBudget(""); setExpActual(""); }}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Expense Item
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{expEditingId ? "Edit Expense" : "Add Expense"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleExpSubmit}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="category" className="text-right">Category</Label>
                                            <Input id="category" value={expCategory} onChange={e => setExpCategory(e.target.value)} className="col-span-3" required />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="budget" className="text-right">Budget</Label>
                                            <Input id="budget" type="number" step="0.01" value={expBudget} onChange={e => setExpBudget(e.target.value)} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="actual" className="text-right">Actual</Label>
                                            <Input id="actual" type="number" step="0.01" value={expActual} onChange={e => setExpActual(e.target.value)} className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Budget</TableHead>
                                        <TableHead className="text-right">Actual</TableHead>
                                        <TableHead className="text-right">Variance</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {yearExpenses.map(e => {
                                        const b = parseCurrency(e.budget);
                                        const a = parseCurrency(e.actual);
                                        const v = b - a; // Budget - Actual for Expense Variance (positive is good)
                                        return (
                                            <TableRow key={e.id}>
                                                <TableCell className="font-medium">{e.category}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(b)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(a)}</TableCell>
                                                <TableCell className={`text-right ${v >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(v)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setExpCategory(e.category); setExpBudget(e.budget); setExpActual(e.actual);
                                                        setExpEditingId(e.id); setIsExpDialogOpen(true);
                                                    }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteExpense(e.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalExpBudget)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalExpActual)}</TableCell>
                                        <TableCell className={`text-right ${(totalExpBudget - totalExpActual) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(totalExpBudget - totalExpActual)}
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
