"use client"

import { Calendar as CalendarIcon, MapPin, Clock, Edit2, Plus } from "lucide-react"
import { useData, Game } from "@/lib/store"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ScheduleView() {
    const { games, addGame, updateGame } = useData()
    const [editingGame, setEditingGame] = useState<Game | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [newGame, setNewGame] = useState<Partial<Game>>({})

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingGame) {
            updateGame(editingGame.id, editingGame)
            setEditingGame(null)
        }
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (newGame.opponent) {
            addGame({
                id: Math.random().toString(36).substr(2, 9),
                status: "Upcoming",
                location: "Home",
                ...newGame
            } as Game)
            setIsAdding(false)
            setNewGame({})
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-6">
                <h3 className="font-semibold leading-none tracking-tight">Upcoming Schedule</h3>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Game</DialogTitle></DialogHeader>
                        <form onSubmit={handleAdd} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Date</Label>
                                <Input value={newGame.date || ""} onChange={e => setNewGame({ ...newGame, date: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Time</Label>
                                <Input value={newGame.time || ""} onChange={e => setNewGame({ ...newGame, time: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Opponent</Label>
                                <Input value={newGame.opponent || ""} onChange={e => setNewGame({ ...newGame, opponent: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Location</Label>
                                <div className="col-span-3">
                                    <Select value={newGame.location} onValueChange={(val: any) => setNewGame({ ...newGame, location: val })}>
                                        <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Home">Home</SelectItem>
                                            <SelectItem value="Away">Away</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter><Button type="submit">Add Game</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="p-6 pt-0">
                <div className="space-y-4">
                    {games.map((game) => (
                        <div key={game.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted text-center">
                                    <span className="text-xs font-semibold uppercase">{game.date.split(" ")[0]}</span>
                                    <span className="text-lg font-bold">{game.date.split(" ")[1]}</span>
                                </div>
                                <div>
                                    <div className="font-semibold">{game.opponent}</div>
                                    <div className="text-sm text-muted-foreground">{game.time}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                    ${game.location === 'Home' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {game.location}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => setEditingGame(game)}>
                                    <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Game</DialogTitle></DialogHeader>
                    {editingGame && (
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Date</Label>
                                <Input value={editingGame.date} onChange={e => setEditingGame({ ...editingGame, date: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Time</Label>
                                <Input value={editingGame.time} onChange={e => setEditingGame({ ...editingGame, time: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Opponent</Label>
                                <Input value={editingGame.opponent} onChange={e => setEditingGame({ ...editingGame, opponent: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Location</Label>
                                <div className="col-span-3">
                                    <Select value={editingGame.location} onValueChange={(val: any) => setEditingGame({ ...editingGame, location: val })}>
                                        <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Home">Home</SelectItem>
                                            <SelectItem value="Away">Away</SelectItem>
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
