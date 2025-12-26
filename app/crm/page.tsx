"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SponsorList } from "@/components/SponsorList"
import { SeasonTicketHolderList } from "@/components/SeasonTicketHolderList"

export default function CRMPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-primary">CRM</h1>
            </div>

            <Tabs defaultValue="sponsors" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                    <TabsTrigger value="season-tickets">Season Ticket Holders</TabsTrigger>
                </TabsList>
                <TabsContent value="sponsors" className="space-y-4">
                    <SponsorList />
                </TabsContent>
                <TabsContent value="season-tickets" className="space-y-4">
                    <SeasonTicketHolderList />
                </TabsContent>
            </Tabs>
        </div>
    )
}
