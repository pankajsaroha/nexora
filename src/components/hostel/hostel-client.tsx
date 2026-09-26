"use client";

import React, { useState } from "react";
import { Building2, Bed, User, Phone, CheckCircle2, Plus, Search, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    type: "BOYS",
    wardenName: "",
    wardenPhone: "",
    initialRooms: 12,
  });

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

  const handleExportRoster = () => {
    const csvContent = [
      ["Wing Name", "Type", "Warden Name", "Warden Phone", "Rooms Count", "Total Beds", "Occupied Beds"].join(","),
      ...hostels.map((h) => {
        const beds = h.rooms.reduce((acc, r) => acc + r.totalBeds, 0);
        const occ = h.rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
        return [h.name, h.type, h.wardenName, h.wardenPhone, h.rooms.length, beds, occ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Nexora_Hostel_Roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddWing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAddSuccess(true);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddSuccess(false);
        router.refresh();
      }, 1000);
    }, 600);
  };

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
              onClick={handleExportRoster}
              leftIcon={<Download className="h-3.5 w-3.5 text-[#B89B62]" />}
            >
              Export Roster
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Wing / Room
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Residency Wings</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{hostels.length}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Active campus blocks</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Configured Rooms</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{totalRooms}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Across all floors</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Total Bed Capacity</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{totalBeds}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Total residential capacity</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Occupancy Rate</div>
          <div className="mt-1 text-2xl font-bold text-[#65705B]">
            {totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0}%
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">{totalOccupied} / {totalBeds} beds assigned</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E5E0D5] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65705B]" />
          <input
            type="search"
            placeholder="Search wing name, type, or warden..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#65705B] focus:outline-none focus:ring-1 focus:ring-[#171614] transition-colors"
          />
        </div>
      </div>

      {/* Hostel Wings Grid */}
      <div className="space-y-4">
        {filteredHostels.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#E5E0D5] bg-[#FAF8F3] text-xs text-[#65705B]">
            No residential wings found matching search.
          </div>
        ) : (
          filteredHostels.map((hostel) => {
            const hBeds = hostel.rooms.reduce((acc, r) => acc + r.totalBeds, 0);
            const hOcc = hostel.rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);

            return (
              <div
                key={hostel.id}
                className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-xs space-y-4 hover:border-[#171614] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E5E0D5] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#171614]">
                          {hostel.name}
                        </h3>
                        <Badge variant="outline" size="sm">
                          {hostel.type}
                        </Badge>
                      </div>
                      <div className="text-[11px] font-mono text-[#65705B] mt-0.5">
                        Occupancy: <span className="font-semibold text-[#171614]">{hOcc} / {hBeds} Beds</span> ({hBeds > 0 ? Math.round((hOcc / hBeds) * 100) : 0}%)
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-0.5 sm:text-right">
                    <div className="font-semibold text-[#171614]">
                      {hostel.wardenName} (Warden)
                    </div>
                    <div className="text-[11px] font-mono text-[#65705B]">
                      {hostel.wardenPhone}
                    </div>
                  </div>
                </div>

                {/* Rooms Matrix */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#65705B] font-bold">
                    Room Inventory & Allocations ({hostel.rooms.length} Rooms)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {hostel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] p-2.5 text-xs space-y-1 text-center hover:bg-white transition-colors"
                      >
                        <div className="font-mono font-bold text-[#171614]">
                          Room {room.roomNumber}
                        </div>
                        <div className="text-[10px] font-mono text-[#65705B]">
                          Floor {room.floor}
                        </div>
                        <div className="text-[11px] font-mono font-semibold pt-1 border-t border-[#E5E0D5] text-[#171614]">
                          {room.occupiedBeds} / {room.totalBeds} Beds
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Wing Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Residential Dormitory Block"
          description="Initialize a new hostel block, floor configurations, and warden in-charge."
          size="md"
        >
          {addSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#B89B62] text-[#B89B62] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#171614]">Hostel Block Initialized</h4>
              <p className="text-xs text-[#65705B]">
                New residential wing configured and ready for student room allotments.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddWing} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171614] mb-1">Hostel Block Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nalanda Scholars Residency"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Residency Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  >
                    <option value="BOYS">Boys Hostel</option>
                    <option value="GIRLS">Girls Hostel</option>
                    <option value="FACULTY">Faculty Quarters</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Initial Room Count *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formData.initialRooms}
                    onChange={(e) => setFormData({ ...formData, initialRooms: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Warden Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Alok Pandey"
                    value={formData.wardenName}
                    onChange={(e) => setFormData({ ...formData, wardenName: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Warden Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98100 88776"
                    value={formData.wardenPhone}
                    onChange={(e) => setFormData({ ...formData, wardenPhone: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Create Block
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
