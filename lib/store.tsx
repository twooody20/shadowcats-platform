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

export type Expense = {
    id: string;
    category: string;
    budget: string;
    actual: string;
    year: string;
};

export type Revenue = {
    id: string;
    category: string;
    budget: string;
    actual: string;
    year: string;
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
    expenses: Expense[];
    addExpense: (expense: Expense) => void;
    updateExpense: (id: string, updates: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;

    revenues: Revenue[];
    addRevenue: (revenue: Revenue) => void;
    updateRevenue: (id: string, updates: Partial<Revenue>) => void;
    deleteRevenue: (id: string) => void;
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
const INITIAL_CATEGORIES: string[] = [];
const INITIAL_PLAYERS: Player[] = [];
const INITIAL_EXPENSES: Expense[] = [];
const INITIAL_REVENUES: Revenue[] = [];

// ... [Keep other initial data constants unchanged] ...
const INITIAL_SEASON_TICKET_HOLDERS: SeasonTicketHolder[] = [];

const INITIAL_SINGLE_GAME_SALES: SingleGameSale[] = [];

const INITIAL_INVENTORY: InventoryItem[] = [];

const INITIAL_SPONSORS: Sponsor[] = [];

const INITIAL_DEALS: Deal[] = [];

const INITIAL_GAMES: Game[] = [];

const INITIAL_TIMELINE: TimelineItem[] = [];

const INITIAL_STAFF: Staff[] = [];

export function DataProvider({ children }: { children: ReactNode }) {
    // Helper hook for File Storage via API
    function useLocalStorage<T>(key: string, initialValue: T) {
        const [storedValue, setStoredValue] = useState<T>(initialValue);

        // Fetch from API on mount
        useEffect(() => {
            fetch(`/api/db?t=${new Date().getTime()}`)
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
    const [expenses, setExpenses] = useLocalStorage<Expense[]>("expenses", INITIAL_EXPENSES);
    const [revenues, setRevenues] = useLocalStorage<Revenue[]>("revenues", INITIAL_REVENUES);

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

    const addExpense = (expense: Expense) => setExpenses([...expenses, expense]);
    const updateExpense = (id: string, updates: Partial<Expense>) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
    };
    const deleteExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const addRevenue = (revenue: Revenue) => setRevenues([...revenues, revenue]);
    const updateRevenue = (id: string, updates: Partial<Revenue>) => {
        setRevenues(revenues.map(r => r.id === id ? { ...r, ...updates } : r));
    };
    const deleteRevenue = (id: string) => {
        setRevenues(revenues.filter(r => r.id !== id));
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
            addPlayer, updatePlayer, deletePlayer,
            expenses, addExpense, updateExpense, deleteExpense,
            revenues, addRevenue, updateRevenue, deleteRevenue
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
