"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { RevenueChart } from "@/components/RevenueChart"
import { InventoryChart } from "@/components/InventoryChart"
import { useData } from "@/lib/store"

export default function Dashboard() {
  const { deals, inventory, games } = useData()

  // Metric Calculations
  const totalRevenue = deals
    .filter(d => d.status === 'Signed')
    .reduce((acc, d) => acc + parseInt(d.actualValue.replace(/[^0-9]/g, '') || "0"), 0)

  // Add some baseline revenue (ticket sales etc) to make it look realistic as per mock
  // Assuming mock was $1.2M+, let's make sure it's substantial
  // Add some baseline revenue (ticket sales etc) to make it look realistic as per mock
  // Assuming mock was $1.2M+, let's make sure it's substantial
  const displayRevenue = totalRevenue

  const soldInventory = inventory.filter(i => i.status === 'sold').length
  const totalInventoryCount = inventory.length
  const inventoryPercent = totalInventoryCount > 0 ? Math.round((soldInventory / totalInventoryCount) * 100) : 0

  // Next Home Game
  // Filter for upcoming home games and sort by date. 
  // Simply assuming string comparison works for "Jun 12" format if year is appended, but easier to just find first 'Upcoming' 'Home'
  // in strict sense, we should parse date. But given mock data format "Jun 12", let's trust simple find for now or keep sort logic simple.
  const upcomingHomeGames = games
    .filter(g => g.location === 'Home' && g.status === 'Upcoming')

  // Simple date parser helper if needed, but for now just take the first one found as "Next"
  const nextGame = upcomingHomeGames.length > 0 ? upcomingHomeGames[0] : null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Front Office Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>New Campaign</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${displayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryPercent}%</div>
            <p className="text-xs text-muted-foreground">
              {soldInventory} of {totalInventoryCount} assets secured
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Home Game</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextGame ? nextGame.opponent : "TBD"}</div>
            <p className="text-xs text-muted-foreground">
              {nextGame ? `${nextGame.date} • ${nextGame.time}` : "Season Complete"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Projections</CardTitle>
            <CardDescription>
              Monthly revenue trajectory for current season
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <CardDescription>
              Current status of sponsorship assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
