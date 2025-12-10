"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type InventoryItem = {
    id: string;
    name: string;
    category: string;
    status?: 'available' | 'sold' | 'pending'; // Deprecated: derived from deals
    sponsor?: string; // Deprecated: derived from deals
    value: string;
};

export type Sponsor = {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    status: 'Active' | 'Negotiating' | 'Inactive';
    totalValue?: string; // Deprecated: derived from deals
};

export type Deal = {
    id: string;
    sponsor: string;
    assets: string[]; // Changed from asset: string
    start: string;
    end: string;
    budget: string; // List Price of Asset
    actualValue: string; // Signed Amount
    paymentMethod: 'Check' | 'Wire' | 'Credit Card' | 'Other';
    processingFee?: string;
    fulfillmentFee?: string;
    paymentStatus: 'Paid' | 'Pending';
    status: 'Signed' | 'Negotiating';
    invoiceId?: string; // Square/External Invoice ID
};

export type Game = {
    id: string;
    date: string;
    time: string;
    opponent: string;
    location: "Home" | "Away";
    status: string;
};

export type TimelineItem = {
    id: string;
    time: string;
    activity: string;
    assigned: string;
    status: "Pending" | "Complete";
};

export type Staff = {
    id: string;
    name: string;
    role: string;
    status: "Active" | "Off";
};

export type SeasonTicketHolder = {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    status: 'Active' | 'Renewal Pending' | 'Past';
    section: string;
    seatCount: string;
    value: string; // Grand Total
    year: string;
    // New Fee breakdown
    unitPrice?: string; // Price per seat per game (derived)
    subtotal?: string; // Net Revenue (base)
    tax?: string;
    ccFee?: string;
    ticketFee?: string;
    paymentMethod?: string;
};

export type SingleGameSale = {
    id: string;
    gameId: string;
    customer: string;
    quantity: number;
    section: string;
    price: string; // Grand Total
    fees?: string; // Legacy fee bucket, or total fees
    status: 'Paid' | 'Reserved';
    // New Fee breakdown
    subtotal?: string;
    tax?: string;
    ccFee?: string;
    ticketFee?: string;
    paymentMethod?: string;
};

export type Player = {
    id: string;
    name: string;
    email: string;
    phone: string;
    seasonType: 'Full Season' | 'Half Season';
    paymentType: 'Full Payment' | 'Deposit' | 'Pay Balance';
    paymentMethod: 'Credit Card' | 'Check' | 'Other';
    amountDue: string; // The price of the season
    paidAmount: string; // What they pay now (Deposit or Full)
    fees: string;
    balance: string; // Remaining due
    status: 'Active' | 'Pending';
    notes?: string;
    paymentLink?: string;
};

type DataContextType = {
    inventory: InventoryItem[];
    sponsors: Sponsor[];
    deals: Deal[];
    games: Game[];
    timeline: TimelineItem[];
    staff: Staff[];
    categories: string[];
    seasonTicketHolders: SeasonTicketHolder[];
    singleGameSales: SingleGameSale[];
    players: Player[]; // New
    addCategory: (category: string) => void;
    updateCategory: (oldName: string, newName: string) => void;
    addInventory: (item: InventoryItem) => void;
    updateInventory: (id: string, updates: Partial<InventoryItem>) => void;
    deleteInventory: (id: string) => void;
    addSponsor: (sponsor: Sponsor) => void;
    updateSponsor: (id: string, updates: Partial<Sponsor>) => void;
    deleteSponsor: (id: string) => void;
    addDeal: (deal: Deal) => void;
    updateDeal: (id: string, updates: Partial<Deal>) => void;
    deleteDeal: (id: string) => void;
    addGame: (game: Game) => void;
    updateGame: (id: string, updates: Partial<Game>) => void;
    addTimelineItem: (item: TimelineItem) => void;
    updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
    addStaff: (staff: Staff) => void;
    updateStaff: (id: string, updates: Partial<Staff>) => void;
    addSeasonTicketHolder: (holder: SeasonTicketHolder) => void;
    updateSeasonTicketHolder: (id: string, updates: Partial<SeasonTicketHolder>) => void;
    deleteSeasonTicketHolder: (id: string) => void;
    addSingleGameSale: (sale: SingleGameSale) => void;
    updateSingleGameSale: (id: string, updates: Partial<SingleGameSale>) => void;
    deleteSingleGameSale: (id: string) => void;
    addPlayer: (player: Player) => void;
    updatePlayer: (id: string, updates: Partial<Player>) => void;
    deletePlayer: (id: string) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Mock Data Constants
const INITIAL_CATEGORIES = ["Signage", "Digital", "Hospitality", "Experiences"];
const INITIAL_PLAYERS: Player[] = [];

// ... [Keep other initial data constants unchanged] ...
const INITIAL_SEASON_TICKET_HOLDERS: SeasonTicketHolder[] = [
    { id: '1', name: "Acme Corp", contact: "Bob Jones", phone: "555-0101", email: "bob@acme.com", status: "Active", section: "101", seatCount: "4", value: "$12,000", year: "2026" },
    { id: '2', name: "The Smith Family", contact: "John Smith", phone: "555-0102", email: "john@smith.com", status: "Active", section: "105", seatCount: "2", value: "$3,500", year: "2026" },
    { id: '3', name: "TechStart Inc", contact: "Alice Williams", phone: "555-0103", email: "alice@techstart.io", status: "Renewal Pending", section: "Suite A", seatCount: "12", value: "$45,000", year: "2026" },
    { id: '4', name: "Old Timer", contact: "Grandpa Joe", phone: "555-0104", email: "joe@aol.com", status: "Past", section: "101", seatCount: "2", value: "$3,000", year: "2025" },
];

const INITIAL_SINGLE_GAME_SALES: SingleGameSale[] = [
    { id: '1', gameId: '1', customer: "Walk-up Fan", quantity: 2, section: "General Admission", price: "$40", fees: "$4", status: "Paid" },
    { id: '2', gameId: '1', customer: "Group Outing", quantity: 20, section: "108", price: "$400", fees: "$40", status: "Paid" },
];

const INITIAL_INVENTORY: InventoryItem[] = [
    { id: '1', name: "Outfield Wall - Left", category: "Signage", status: "sold", sponsor: "Coca Cola", value: "$15,000" },
    { id: '2', name: "Outfield Wall - Center", category: "Signage", status: "available", sponsor: "-", value: "$20,000" },
    { id: '3', name: "3x10 Out Field Signage", category: "Signage", status: "sold", sponsor: "Buffalo Wild Wings", value: "$30,000" },
    { id: '4', name: "Jersey Patch", category: "Signage", status: "sold", sponsor: "First Bank", value: "$50,000" },
    { id: '5', name: "Dugout Top - Home", category: "Signage", status: "pending", sponsor: "Pizza Hut", value: "$10,000" },
    { id: '6', name: "Dugout Top - Away", category: "Signage", status: "available", sponsor: "-", value: "$10,000" },
    { id: '7', name: "Scoreboard Video", category: "Digital", status: "sold", sponsor: "Verizon", value: "$30,000" },
    { id: '8', name: "Ticket Backs", category: "Print", status: "available", sponsor: "-", value: "$5,000" },
];

const INITIAL_SPONSORS: Sponsor[] = [
    { id: '1', name: "Coca Cola", contact: "Jane Doe", phone: "555-0101", email: "jane@coke.com", status: "Active", totalValue: "$45,000" },
    { id: '2', name: "First Bank", contact: "John Smith", phone: "555-0102", email: "john@firstbank.com", status: "Active", totalValue: "$50,000" },
    { id: '3', name: "Ford", contact: "Mike Ross", phone: "555-0103", email: "mike@ford.com", status: "Active", totalValue: "$15,000" },
    { id: '4', name: "Pizza Hut", contact: "Sarah Lee", phone: "555-0104", email: "sarah@pizzahut.com", status: "Negotiating", totalValue: "$10,000 (Proj)" },
    { id: '5', name: "Verizon", contact: "Tom Wilson", phone: "555-0105", email: "tom@verizon.com", status: "Active", totalValue: "$30,000" },
    { id: '6', name: "Buffalo Wild Wings", contact: "Manager", phone: "555-0199", email: "manager@bww.com", status: "Active", totalValue: "$30,000" },
];

const INITIAL_DEALS: Deal[] = [
    { id: "DL-001", sponsor: "Coca Cola", assets: ["Outfield Wall - Left"], start: "2026-04-01", end: "2028-10-01", budget: "$15,000", actualValue: "$15,000", paymentMethod: "Wire", paymentStatus: "Paid", status: "Signed" },
    { id: "DL-002", sponsor: "First Bank", assets: ["Jersey Patch"], start: "2027-04-01", end: "2027-10-01", budget: "$50,000", actualValue: "$48,000", paymentMethod: "Check", paymentStatus: "Paid", status: "Signed" },
    { id: "DL-003", sponsor: "Pizza Hut", assets: ["Dugout Top - Home"], start: "2027-05-01", end: "2027-10-01", budget: "$10,000", actualValue: "$9,500", paymentMethod: "Credit Card", processingFee: "$285", paymentStatus: "Pending", status: "Negotiating" },
    { id: "DL-004", sponsor: "Buffalo Wild Wings", assets: ["3x10 Out Field Signage"], start: "2026-04-01", end: "2027-10-01", budget: "$30,000", actualValue: "$30,000", paymentMethod: "Check", paymentStatus: "Paid", status: "Signed" },
];

const INITIAL_GAMES: Game[] = [
    { id: '1', date: "2026-06-12", time: "7:05 PM", opponent: "vs. Rebels", location: "Home", status: "Upcoming" },
    { id: '2', date: "2026-06-13", time: "6:05 PM", opponent: "vs. Rebels", location: "Home", status: "Upcoming" },
    { id: '3', date: "2026-06-14", time: "1:05 PM", opponent: "vs. Rebels", location: "Home", status: "Upcoming" },
    { id: '4', date: "2026-06-16", time: "7:05 PM", opponent: "@ Knights", location: "Away", status: "Upcoming" },
];

const INITIAL_TIMELINE: TimelineItem[] = [
    { id: '1', time: "2:00 PM", activity: "Staff Arrival", assigned: "All Staff", status: "Pending" },
    { id: '2', time: "3:30 PM", activity: "Gates Open Check", assigned: "Operations", status: "Pending" },
    { id: '3', time: "4:00 PM", activity: "Batting Practice (Home)", assigned: "Field Crew", status: "Pending" },
    { id: '4', time: "5:00 PM", activity: "Gates Open", assigned: "Ticketing / Security", status: "Pending" },
    { id: '5', time: "6:30 PM", activity: "Pregame Ceremonies", assigned: "Marketing", status: "Pending" },
    { id: '6', time: "7:05 PM", activity: "First Pitch", assigned: "-", status: "Pending" },
];

const INITIAL_STAFF: Staff[] = [
    { id: '1', name: "Sarah Connor", role: "Director of Ops", status: "Active" },
    { id: '2', name: "Kyle Reese", role: "Field Manager", status: "Active" },
    { id: '3', name: "John Smith", role: "Security Lead", status: "Active" },
    { id: '4', name: "Jane Doe", role: "Ticketing Manager", status: "Off" },
];

export function DataProvider({ children }: { children: ReactNode }) {
    // Helper hook for File Storage via API
    function useLocalStorage<T>(key: string, initialValue: T) {
        const [storedValue, setStoredValue] = useState<T>(initialValue);

        // Fetch from API on mount
        useEffect(() => {
            fetch('/api/db')
                .then(res => res.json())
                .then(data => {
                    // Check if key exists in DB (even if value is empty array or falsy)
                    if (data && Object.prototype.hasOwnProperty.call(data, key)) {
                        setStoredValue(data[key]);
                    }
                })
                .catch(err => console.error("Failed to load data", err));
        }, [key]);

        const setValue = (value: T | ((val: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);

                // Persist to API
                fetch('/api/db', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, data: valueToStore })
                }).catch(err => console.error("Failed to save data", err));

            } catch (error) {
                console.log(error);
            }
        };

        return [storedValue, setValue] as const;
    }

    const [categories, setCategories] = useLocalStorage<string[]>("categories", INITIAL_CATEGORIES);
    const [seasonTicketHolders, setSeasonTicketHolders] = useLocalStorage<SeasonTicketHolder[]>("seasonTicketHolders", INITIAL_SEASON_TICKET_HOLDERS);
    const [singleGameSales, setSingleGameSales] = useLocalStorage<SingleGameSale[]>("singleGameSales", INITIAL_SINGLE_GAME_SALES);
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>("inventory", INITIAL_INVENTORY);
    const [sponsors, setSponsors] = useLocalStorage<Sponsor[]>("sponsors", INITIAL_SPONSORS);
    const [deals, setDeals] = useLocalStorage<Deal[]>("deals", INITIAL_DEALS);
    const [games, setGames] = useLocalStorage<Game[]>("games", INITIAL_GAMES);
    const [timeline, setTimeline] = useLocalStorage<TimelineItem[]>("timeline", INITIAL_TIMELINE);
    const [staff, setStaff] = useLocalStorage<Staff[]>("staff", INITIAL_STAFF);
    const [players, setPlayers] = useLocalStorage<Player[]>("players", INITIAL_PLAYERS);

    const addCategory = (category: string) => setCategories([...categories, category]);
    const updateCategory = (oldName: string, newName: string) => {
        setCategories(categories.map(c => c === oldName ? newName : c));
        // Force update all items that had this category
        setInventory(prev => prev.map(item => item.category === oldName ? { ...item, category: newName } : item));
    }

    const addInventory = (item: InventoryItem) => setInventory([...inventory, item]);
    const updateInventory = (id: string, updates: Partial<InventoryItem>) => {
        const oldItem = inventory.find(i => i.id === id);
        if (oldItem && updates.name && updates.name !== oldItem.name) {
            // Cascade update to deals
            setDeals(prev => prev.map(d => ({
                ...d,
                assets: (d.assets || []).map(a => a === oldItem.name ? updates.name! : a)
            })));
        }
        setInventory(inventory.map(item => item.id === id ? { ...item, ...updates } : item));
    };
    const deleteInventory = (id: string) => {
        const itemToDelete = inventory.find(i => i.id === id);
        if (itemToDelete) {
            setDeals(prev => prev.filter(d => !(d.assets || []).includes(itemToDelete.name))); // Remove associated deals
            setInventory(prev => prev.filter(item => item.id !== id));
        }
    };

    const addSponsor = (sponsor: Sponsor) => setSponsors([...sponsors, sponsor]);
    const updateSponsor = (id: string, updates: Partial<Sponsor>) => {
        setSponsors(sponsors.map(item => item.id === id ? { ...item, ...updates } : item));
    };
    const deleteSponsor = (id: string) => {
        setSponsors(sponsors.filter(item => item.id !== id));
    };

    const addDeal = (deal: Deal) => setDeals([...deals, deal]);
    const updateDeal = (id: string, updates: Partial<Deal>) => {
        setDeals(deals.map(item => item.id === id ? { ...item, ...updates } : item));
    };
    const deleteDeal = (id: string) => {
        const dealToDelete = deals.find(d => d.id === id);
        if (dealToDelete) {
            setDeals(deals.filter(d => d.id !== id));
            // Reset inventory status
            setInventory(prev => prev.map(item => (dealToDelete.assets || []).includes(item.name) ? { ...item, status: 'available', sponsor: '-' } : item));
        }
    };

    const addGame = (game: Game) => setGames([...games, game]);
    const updateGame = (id: string, updates: Partial<Game>) => {
        setGames(games.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addTimelineItem = (item: TimelineItem) => setTimeline([...timeline, item]);
    const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
        setTimeline(timeline.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addStaff = (s: Staff) => setStaff([...staff, s]);
    const updateStaff = (id: string, updates: Partial<Staff>) => {
        setStaff(staff.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const addSeasonTicketHolder = (holder: SeasonTicketHolder) => setSeasonTicketHolders([...seasonTicketHolders, holder]);
    const updateSeasonTicketHolder = (id: string, updates: Partial<SeasonTicketHolder>) => {
        setSeasonTicketHolders(seasonTicketHolders.map(item => item.id === id ? { ...item, ...updates } : item));
    };
    const deleteSeasonTicketHolder = (id: string) => {
        setSeasonTicketHolders(seasonTicketHolders.filter(item => item.id !== id));
    };

    const addSingleGameSale = (sale: SingleGameSale) => setSingleGameSales([...singleGameSales, sale]);
    const updateSingleGameSale = (id: string, updates: Partial<SingleGameSale>) => {
        setSingleGameSales(singleGameSales.map(item => item.id === id ? { ...item, ...updates } : item));
    };
    const deleteSingleGameSale = (id: string) => {
        setSingleGameSales(singleGameSales.filter(item => item.id !== id));
    };

    const addPlayer = (player: Player) => setPlayers([...players, player]);
    const updatePlayer = (id: string, updates: Partial<Player>) => {
        setPlayers(players.map(p => p.id === id ? { ...p, ...updates } : p));
    };
    const deletePlayer = (id: string) => {
        setPlayers(players.filter(p => p.id !== id));
    };

    return (
        <DataContext.Provider value={{
            inventory, sponsors, deals, games, timeline, staff, categories, seasonTicketHolders, singleGameSales, players,
            addCategory, updateCategory,
            addInventory, updateInventory, deleteInventory,
            addSponsor, updateSponsor, deleteSponsor,
            addDeal, updateDeal, deleteDeal,
            addGame, updateGame,
            addTimelineItem, updateTimelineItem,
            addStaff, updateStaff,
            addSeasonTicketHolder, updateSeasonTicketHolder, deleteSeasonTicketHolder,
            addSingleGameSale, updateSingleGameSale, deleteSingleGameSale,
            addPlayer, updatePlayer, deletePlayer
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
