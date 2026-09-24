"use client";

import React, { useState } from "react";
import { Building2, Bed, User, Phone, CheckCircle2, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/utils";

export interface HostelItem {
  id: string;
  name: string;
  type: string;
  wardenName: string;
  wardenPhone: string;
  rooms: Array<{
    id: string;
    roomNumber: string;
    floor: number;
    totalBeds: number;
    occupiedBeds: number;
    feePerTerm: number;
  }>;
}

export function HostelClient({ hostels }: { hostels: HostelItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const totalRooms = hostels.reduce((acc, h) => acc + h.rooms.length, 0);
  const totalBeds = hostels.reduce(
    (acc, h) => acc + h.rooms.reduce((rAcc, r) => rAcc + r.totalBeds, 0),
    0
  );
  const totalOccupied = hostels.reduce(
    (acc, h) => acc + h.rooms.reduce((rAcc, r) => rAcc + r.occupiedBeds, 0),
    0
  );

  const filteredHostels = hostels.filter((h) => {
    return (
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.wardenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Campus Living & Housing"
        title="Hostel & Residential Dorms"
        description="Residential halls, floor plans, room inventories, bed occupancy ratios, and warden assignments."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Hostel roster exported.")}
            >
              Export Roster
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => alert("Add Dormitory wing modal will open.")}
            >
              Add Wing / Room
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Residency Wings</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{hostels.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Active campus blocks</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Configured Rooms</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalRooms}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Across all floors</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Bed Capacity</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalBeds}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Total residential capacity</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Occupancy Rate</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">{totalOccupied} / {totalBeds} beds assigned</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E8E7DF] shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search hostel name, warden, or residency type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
      </div>

      {/* Hostels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHostels.map((h) => (
          <div
            key={h.id}
            className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-4 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {h.name}
                </h3>
                <div className="text-[11px] font-mono text-slate-400">
                  Residency Type: {h.type}
                </div>
              </div>
              <Badge variant="outline" size="sm">
                Warden: {h.wardenName}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs bg-[#FAF9F5] border border-[#E8E7DF] p-2.5 rounded-lg">
              <span className="text-slate-600">Warden Contact: <strong className="text-slate-900">{h.wardenName}</strong></span>
              <span className="font-mono text-[11px] font-semibold text-slate-900">{h.wardenPhone}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {h.rooms.map((rm) => (
                <div
                  key={rm.id}
                  className="rounded-lg bg-[#FAF9F5] p-3 border border-[#E8E7DF] space-y-1 hover:bg-white transition-colors"
                >
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Room {rm.roomNumber}</span>
                    <span className="text-[10px] font-mono text-slate-400">Floor {rm.floor}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Beds: <span className="font-mono font-bold text-slate-900">{rm.occupiedBeds} / {rm.totalBeds} Occupied</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 pt-0.5">
                    {formatCurrency(rm.feePerTerm)} / Term
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
