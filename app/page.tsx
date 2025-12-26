"use client"

import { RevenueChart } from "@/components/RevenueChart"
import { InventoryChart } from "@/components/InventoryChart"
import { DollarSign, TrendingUp, TrendingDown, Calendar, Ticket } from "lucide-react"
import { useData } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const { deals, singleGameSales, seasonTicketHolders, games, players, expenses, revenues } = useData()
  const [selectedYear, setSelectedYear] = useState<string>("2026")
  const [activeTab, setActiveTab] = useState("overview")
  const [activeTransTab, setActiveTransTab] = useState("sponsorships")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Helper to parse currency
  const parseCurrency = (val: string) => parseFloat(val?.replace(/[^0-9.-]/g, '') || "0")
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)

  // Filter Logic
  const isDealActiveInYear = (deal: any, targetYear: string) => {
    const startYear = new Date(deal.start).getFullYear()
    const endYear = new Date(deal.end).getFullYear()
    const target = parseInt(targetYear)
    return target >= startYear && target <= endYear
  }

  const yearDeals = deals.filter(d => isDealActiveInYear(d, selectedYear))
  const signedYearDeals = yearDeals.filter(d => d.status === 'Signed')

  // --- Detailed Calculations ---

  // 1. Sponsorships
  let spsGross = 0
  let spsFees = 0
  signedYearDeals.forEach(d => {
    spsGross += parseCurrency(d.actualValue)
    spsFees += parseCurrency(d.processingFee || "0") + parseCurrency(d.fulfillmentFee || "0")
  })
  const spsNet = spsGross - spsFees

  // 2. Tickets
  let tixGross = 0
  let tixNet = 0
  let tixTax = 0
  let tixFees = 0

  // Season
  const yearSeasonTickets = seasonTicketHolders.filter(h => h.year === selectedYear)
  yearSeasonTickets.forEach(h => {
    const val = parseCurrency(h.value) // Gross
    const sub = h.subtotal ? parseCurrency(h.subtotal) : val // Net (fallback to gross if old)
    const tax = parseCurrency(h.tax || "0")
    const fee = parseCurrency(h.ccFee || "0") + parseCurrency(h.ticketFee || "0")

    // If modern record (has subtotal), use exacts. If legacy, assume Gross=Net.
    if (h.subtotal) {
      tixGross += val
      tixNet += sub
      tixTax += tax
      tixFees += fee
    } else {
      tixGross += val
      tixNet += val
    }
  })

  // Single Game
  const yearGames = games.filter(g => g.date.includes(selectedYear))
  const yearGameIds = yearGames.map(g => g.id)
  const yearSingleSales = singleGameSales.filter(s => yearGameIds.includes(s.gameId))

  yearSingleSales.forEach(s => {
    const val = parseCurrency(s.price) // Gross
    const sub = s.subtotal ? parseCurrency(s.subtotal) : val
    const tax = parseCurrency(s.tax || "0")
    const fee = parseCurrency(s.ccFee || "0") + parseCurrency(s.ticketFee || "0")

    if (s.subtotal) {
      tixGross += val
      tixNet += sub
      tixTax += tax
      tixFees += fee
    } else {
      tixGross += val
      tixNet += val
    }
  })

  // 3. Players
  let plyGross = 0
  let plyNet = 0
  let plyFees = 0
  let plyPaid = 0

  // Assume players are for 2026 season for now
  if (selectedYear === "2026") {
    (players || []).forEach(p => {
      const val = parseCurrency(p.amountDue) // Net/Base
      const fee = parseCurrency(p.fees) // Fees
      const paid = parseCurrency(p.paidAmount)

      plyGross += val + fee
      plyNet += val
      plyFees += fee
      plyPaid += paid
    })
  }

  // Calculate Paid from other sources
  let spsPaid = 0
  signedYearDeals.forEach(d => {
    if (d.paymentStatus === 'Paid') {
      spsPaid += parseCurrency(d.actualValue)
    }
  })

  let tixPaid = 0
  // Simplified assumption: All Ticket Net Revenue is considered paid/collected for this dashboard view
  // unless specific status dictates otherwise. Single Game sales are 'Paid'. Sth generally paid or invoiced.
  // For "Amount Paid", we should ideally track actual payments.
  // For now, let's sum up STH value + Single Game "Paid" sales.
  yearSeasonTickets.forEach(h => {
    tixPaid += parseCurrency(h.value)
  })
  yearSingleSales.forEach(s => {
    if (s.status === 'Paid') {
      tixPaid += parseCurrency(s.price)
    }
  })

  // 4. Expenses
  let totalExpenses = 0
  let totalExpensesBudget = 0
  const yearExpenses = expenses.filter(e => e.year === selectedYear)
  yearExpenses.forEach(e => {
    totalExpenses += parseCurrency(e.actual || "0")
    totalExpensesBudget += parseCurrency(e.budget || "0")
  })

  // 5. Manual Revenues
  let manualRev = 0
  const yearRevenues = revenues.filter(r => r.year === selectedYear)
  yearRevenues.forEach(r => {
    manualRev += parseCurrency(r.actual || "0")
  })

  // Totals
  // Note: Tickets and Players are now manually input on Budget page (included in manualRev), so we exclude their automated 'Net' from here to avoid double counting.
  // We keep 'Gross' calculations for specific cards if needed, but for 'Net Profit' we align with Budget.

  const totalGross = spsGross + manualRev // + tixGross + plyGross (Removed automated gross from top line to align with manual budget)
  const totalNet = spsNet + manualRev // + tixNet + plyNet
  const netProfit = totalNet - totalExpenses // Net Profit (Operating Income)
  const totalFeesAndTax = spsFees + tixTax + tixFees + plyFees
  const totalPaid = spsPaid + tixPaid + plyPaid
  const totalRemaining = totalGross - totalPaid
  const margin = totalGross > 0 ? (totalNet / totalGross) * 100 : 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Financials & Forecasting</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {["2025", "2026", "2027", "2028", "2029", "2030"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="relative z-10">
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>Overview</TabsTrigger>
          <TabsTrigger value="transactions" onClick={() => setActiveTab("transactions")}>Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">

          {/* Metric Cards - Accounting Equation Flow */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalGross)}</div>
                <p className="text-xs text-muted-foreground">Total Invoiced</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing & Fees</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalFeesAndTax)}</div>
                <p className="text-xs text-muted-foreground">CC Fees, Tax & Fulfillment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales Tax Liability</CardTitle>
                <div className="h-4 w-4 text-red-500 font-bold">%</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(tixTax)}</div>
                <p className="text-xs text-muted-foreground">Pass-through to Gov</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalNet)}</div>
                <p className="text-xs text-muted-foreground">Available Cash</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
                <p className="text-xs text-muted-foreground">Collected</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">Budgeted: {formatCurrency(totalExpensesBudget)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(netProfit)}</div>
                <p className="text-xs text-muted-foreground">Gross - Expenses</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Breakdown Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue by Source (Net)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Sponsorships</div>
                  <div className="text-2xl font-bold">{formatCurrency(spsNet)}</div>
                  <p className="text-xs text-muted-foreground">{(totalNet > 0 ? spsNet / totalNet * 100 : 0).toFixed(0)}% of Total</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Tickets</div>
                  <div className="text-2xl font-bold">{formatCurrency(tixNet)}</div>
                  <p className="text-xs text-muted-foreground">{(totalNet > 0 ? tixNet / totalNet * 100 : 0).toFixed(0)}% of Total</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Players</div>
                  <div className="text-2xl font-bold">{formatCurrency(plyNet)}</div>
                  <p className="text-xs text-muted-foreground">{(totalNet > 0 ? plyNet / totalNet * 100 : 0).toFixed(0)}% of Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <span className="font-bold">{margin.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full w-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${margin}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Retained Earnings per Dollar</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Cumulative revenue recognition for {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart year={selectedYear} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Inventory Distribution</CardTitle>
                <CardDescription>Status of assets for {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryChart year={selectedYear} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Tabs value={activeTransTab} onValueChange={setActiveTransTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Detailed Transactions</h2>
              <TabsList className="relative z-10">
                <TabsTrigger value="sponsorships" onClick={() => setActiveTransTab("sponsorships")}>Sponsorships</TabsTrigger>
                <TabsTrigger value="tickets" onClick={() => setActiveTransTab("tickets")}>Tickets</TabsTrigger>
                <TabsTrigger value="players" onClick={() => setActiveTransTab("players")}>Players</TabsTrigger>
                <TabsTrigger value="expenses" onClick={() => setActiveTransTab("expenses")}>Expenses</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sponsorships">
              <Card>
                <CardHeader>
                  <CardTitle>Sponsorship Agreements</CardTitle>
                  <CardDescription>Active corporate partner contracts for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-4 text-left font-medium">Sponsor</th>
                          <th className="p-4 text-left font-medium">Inv ID</th>
                          <th className="p-4 text-left font-medium">Asset</th>
                          <th className="p-4 text-center font-medium">Status</th>
                          <th className="p-4 text-right font-medium">Gross</th>
                          <th className="p-4 text-right font-medium">Fees</th>
                          <th className="p-4 text-right font-medium">Net</th>
                          <th className="p-4 text-center font-medium">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearDeals.length > 0 ? (
                          yearDeals.map(deal => {
                            const gross = parseCurrency(deal.actualValue || deal.budget || "0")
                            const fees = parseCurrency(deal.processingFee || "0") + parseCurrency(deal.fulfillmentFee || "0")
                            const net = gross - fees
                            return (
                              <tr key={deal.id} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="p-4">
                                  <Link href="/crm" className="font-medium text-blue-600 hover:underline">
                                    {deal.sponsor}
                                  </Link>
                                </td>
                                <td className="p-4 text-xs font-mono text-muted-foreground">{deal.invoiceId || "-"}</td>
                                <td className="p-4">{deal.assets ? deal.assets.join(", ") : "-"}</td>
                                <td className="p-4 text-center">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${deal.status === 'Signed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {deal.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">{formatCurrency(gross)}</td>
                                <td className="p-4 text-right text-red-600">-{formatCurrency(fees)}</td>
                                <td className="p-4 text-right font-bold text-green-600">{formatCurrency(net)}</td>
                                <td className="p-4 text-center">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${deal.paymentStatus === 'Paid'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {deal.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                              No sponsorship transactions found for {selectedYear}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Sales</CardTitle>
                  <CardDescription>Season Tickets and Single Game Sales for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-4 text-left font-medium">Type</th>
                          <th className="p-4 text-left font-medium">Customer/Details</th>
                          <th className="p-4 text-right font-medium">Gross</th>
                          <th className="p-4 text-right font-medium">Taxable</th>
                          <th className="p-4 text-right font-medium">Tax</th>
                          <th className="p-4 text-right font-medium">Fees</th>
                          <th className="p-4 text-right font-medium">Net</th>
                          <th className="p-4 text-center font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearSeasonTickets.length === 0 && yearSingleSales.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                              No ticket transactions found for {selectedYear}.
                            </td>
                          </tr>
                        )}
                        {yearSeasonTickets.map(sth => {
                          const gross = parseCurrency(sth.value)
                          const sub = sth.subtotal ? parseCurrency(sth.subtotal) : gross
                          const tax = parseCurrency(sth.tax || "0")
                          const fees = parseCurrency(sth.ccFee || "0") + parseCurrency(sth.ticketFee || "0")
                          return (
                            <tr key={sth.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="p-4">
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                                  Season
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="font-medium">{sth.name}</div>
                                <div className="text-xs text-muted-foreground">{sth.seatCount} Seats • {sth.section}</div>
                              </td>
                              <td className="p-4 text-right">{formatCurrency(gross)}</td>
                              <td className="p-4 text-right">{formatCurrency(sub)}</td>
                              <td className="p-4 text-right text-red-600">{formatCurrency(tax)}</td>
                              <td className="p-4 text-right text-red-600">{formatCurrency(fees)}</td>
                              <td className="p-4 text-right font-bold text-green-600">{formatCurrency(sub)}</td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        {yearSingleSales.map(sale => {
                          const gross = parseCurrency(sale.price)
                          const sub = sale.subtotal ? parseCurrency(sale.subtotal) : gross
                          const tax = parseCurrency(sale.tax || "0")
                          const fees = parseCurrency(sale.ccFee || "0") + parseCurrency(sale.ticketFee || "0")
                          return (
                            <tr key={sale.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="p-4">
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                                  Single
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="font-medium">{sale.customer}</div>
                                <div className="text-xs text-muted-foreground">Qty: {sale.quantity} • {sale.section}</div>
                              </td>
                              <td className="p-4 text-right">{formatCurrency(gross)}</td>
                              <td className="p-4 text-right">{formatCurrency(sub)}</td>
                              <td className="p-4 text-right text-red-600">{formatCurrency(tax)}</td>
                              <td className="p-4 text-right text-red-600">{formatCurrency(fees)}</td>
                              <td className="p-4 text-right font-bold text-green-600">{formatCurrency(sub)}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sale.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {sale.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <CardTitle>Player Registrations</CardTitle>
                  <CardDescription>Player fees and payments for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-4 text-left font-medium">Player</th>
                          <th className="p-4 text-left font-medium">Type</th>
                          <th className="p-4 text-left font-medium">Ref</th>
                          <th className="p-4 text-right font-medium">Gross</th>
                          <th className="p-4 text-right font-medium">Fees</th>
                          <th className="p-4 text-right font-medium">Net</th>
                          <th className="p-4 text-right font-medium">Paid</th>
                          <th className="p-4 text-right font-medium">Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!players || players.length === 0) ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                              No player records found.
                            </td>
                          </tr>
                        ) : (
                          players.map((p, idx) => {
                            const gross = parseCurrency(p.amountDue)
                            const fee = parseCurrency(p.fees)
                            const net = gross - fee
                            const paid = parseCurrency(p.paidAmount)
                            // const remaining = net + fee - paid
                            const totalDue = gross + fee // If we want balance to reflect reality of what is OWED (usually includes fee if passed on).
                            // Wait, in PlayerList:
                            // balance was player.balance.
                            // player.balance is updated in Dialog as (SeasonPrice - Paid) or similar.
                            // Let's stick to parsing p.balance directly if possible, or using derived if we trust our math.
                            // In PlayerDialog: balance = remainder. remainder = SeasonPrice - Paid.
                            // But earlier I thought remainder = SeasonPrice + Fee - Paid.
                            // Let's check db.json or store.
                            // Store says: balance: string; // Remaining due.
                            // Let's use p.balance directly for balance column to be safe/consistent with list.

                            const balance = parseCurrency(p.balance)

                            return (
                              <tr key={p.id || idx} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="p-4 font-medium">{p.name}</td>
                                <td className="p-4">{p.seasonType}</td>
                                <td className="p-4 cursor-pointer">
                                  {p.paymentLink ? <a href={p.paymentLink} target="_blank" className="text-blue-600 hover:underline text-xs">Link</a> : <span className="text-muted-foreground">-</span>}
                                </td>
                                <td className="p-4 text-right">{formatCurrency(gross)}</td>
                                <td className="p-4 text-right text-red-600">-{formatCurrency(fee)}</td>
                                <td className="p-4 text-right font-bold text-green-600">{formatCurrency(net)}</td>
                                <td className="p-4 text-right text-blue-600">{formatCurrency(paid)}</td>
                                <td className={`p-4 text-right font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(balance)}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Budgeted Expenses</CardTitle>
                  <CardDescription>Operational breakdown for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-4 text-left font-medium">Category</th>
                          <th className="p-4 text-right font-medium">Budget</th>
                          <th className="p-4 text-right font-medium">Actual</th>
                          <th className="p-4 text-right font-medium">Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearExpenses.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                              No expenses found for {selectedYear}.
                            </td>
                          </tr>
                        ) : (
                          yearExpenses.map(exp => {
                            const bud = parseCurrency(exp.budget || "0")
                            const act = parseCurrency(exp.actual || "0")
                            const variance = bud - act // Positive if under budget
                            return (
                              <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/50">
                                <td className="p-4 font-medium">{exp.category}</td>
                                <td className="p-4 text-right">{formatCurrency(bud)}</td>
                                <td className="p-4 text-right">{formatCurrency(act)}</td>
                                <td className={`p-4 text-right font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(variance)}
                                </td>
                              </tr>
                            )
                          })
                        )}
                        {/* Total Row */}
                        <tr className="bg-muted/50 font-bold border-t">
                          <td className="p-4">Total</td>
                          <td className="p-4 text-right">{formatCurrency(yearExpenses.reduce((sum, e) => sum + parseCurrency(e.budget || "0"), 0))}</td>
                          <td className="p-4 text-right">{formatCurrency(yearExpenses.reduce((sum, e) => sum + parseCurrency(e.actual || "0"), 0))}</td>
                          <td className="p-4 text-right">
                            {formatCurrency(yearExpenses.reduce((sum, e) => sum + (parseCurrency(e.budget || "0") - parseCurrency(e.actual || "0")), 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
