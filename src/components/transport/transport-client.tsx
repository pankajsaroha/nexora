"use client";

import React, { useState } from "react";
import { Bus, MapPin, Clock, Phone, User, Users, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export interface RouteItem {
  id: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  stops: Array<{
    id: string;
    stopName: string;
    stopOrder: number;
    pickupTime: string;
    dropTime: string;
    feeAmount: number;
  }>;
}

export function TransportClient({ routes }: { routes: RouteItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const totalStops = routes.reduce((acc, r) => acc + r.stops.length, 0);
  const totalFleetCapacity = routes.reduce((acc, r) => acc + r.capacity, 0);

  const filteredRoutes = routes.filter((r) => {
    return (
      r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.stops.some((s) => s.stopName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Logistics & Fleet Operations"
        title="Transport & Transit Routes"
        description="Bus routes, vehicle manifests, driver credentials, and scheduled morning/evening pickup checkpoints."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Fleet manifest ready for download.")}
            >
              Export Manifest
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => alert("Add Transport Route modal will open.")}
            >
              Add Route
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active Routes</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{routes.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Scheduled transit corridors</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Checkpoints</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalStops}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Pick-up & drop locations</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Fleet Capacity</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalFleetCapacity}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Total bus seats</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Fleet Status</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">100% Operational</div>
          <div className="mt-0.5 text-[11px] text-slate-500">GPS & speed limiter active</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E8E7DF] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search route name, bus number, stop, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRoutes.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-4 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAF9F5] border border-[#E8E7DF] text-slate-900 font-bold">
                  <Bus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {r.routeName}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Bus #{r.vehicleNumber} • Seating: {r.capacity} Pax
                  </span>
                </div>
              </div>

              <Badge variant="success" size="sm">
                Active Fleet
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs bg-[#FAF9F5] border border-[#E8E7DF] p-2.5 rounded-lg">
              <span className="text-slate-600">Assigned Driver: <strong className="text-slate-900">{r.driverName}</strong></span>
              <span className="font-mono text-[11px] font-semibold text-slate-900">{r.driverPhone}</span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Scheduled Route Stops & Timings:
              </div>
              <div className="space-y-1.5 text-xs">
                {r.stops.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E7DF]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-white text-[10px] font-mono font-bold">
                        {st.stopOrder}
                      </span>
                      <span className="font-medium text-slate-800">
                        {st.stopName}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      Pick: <strong className="text-slate-900">{st.pickupTime}</strong> • Drop: {st.dropTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
