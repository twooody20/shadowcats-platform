import { ScheduleView } from "@/components/ScheduleView"
import { GameDayPlanner } from "@/components/GameDayPlanner"
import { StaffAssignment } from "@/components/StaffAssignment"

export default function OperationsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Operations Center</h1>
                <div className="flex gap-2">
                    <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        New Event
                    </button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Schedule & Planner */}
                <div className="col-span-2 space-y-8">
                    <ScheduleView />
                    <GameDayPlanner />
                </div>

                {/* Right Column: Staffing */}
                <div className="col-span-1 space-y-8">
                    <StaffAssignment />

                    {/* Weather Widget Placeholder */}
                    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">Weather Forecast</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold">72°F</div>
                                <div className="text-sm text-muted-foreground">Partly Cloudy</div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                                <div>Precip: 0%</div>
                                <div>Wind: 5mph</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
