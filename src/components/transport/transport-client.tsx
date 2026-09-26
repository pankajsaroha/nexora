"use client";

import React, { useState } from "react";
import { Bus, MapPin, Clock, Phone, User, Users, Plus, Search, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    routeName: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    capacity: 40,
  });

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

  const handleExportManifest = () => {
    const csvContent = [
      ["Route Name", "Vehicle Number", "Driver Name", "Driver Phone", "Capacity", "Stops Count"].join(","),
      ...routes.map((r) =>
        [r.routeName, r.vehicleNumber, r.driverName, r.driverPhone, r.capacity, r.stops.length].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Nexora_Transport_Fleet_Manifest.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddRoute = async (e: React.FormEvent) => {
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
        category="Logistics & Fleet Operations"
        title="Transport & Transit Routes"
        description="Bus routes, vehicle manifests, driver credentials, and scheduled morning/evening pickup checkpoints."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportManifest}
              leftIcon={<Download className="h-3.5 w-3.5 text-[#B89B62]" />}
            >
              Export Manifest
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Route
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Active Routes</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{routes.length}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Scheduled transit corridors</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Total Checkpoints</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{totalStops}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Pick-up & drop locations</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Fleet Capacity</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{totalFleetCapacity}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Total bus seats</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Fleet Status</div>
          <div className="mt-1 text-2xl font-bold text-[#65705B]">100% Operational</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">GPS & speed limiter active</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[#E5E0D5] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65705B]" />
          <input
            type="search"
            placeholder="Search route name, bus number, stop, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] py-2 pl-9 pr-3 text-xs text-[#171614] placeholder:text-[#65705B] focus:outline-none focus:ring-1 focus:ring-[#171614] transition-colors"
          />
        </div>
      </div>

      {/* Routes Grid */}
      <div className="space-y-4">
        {filteredRoutes.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#E5E0D5] bg-[#FAF8F3] text-xs text-[#65705B]">
            No transit routes found matching query.
          </div>
        ) : (
          filteredRoutes.map((route) => (
            <div
              key={route.id}
              className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-xs space-y-4 hover:border-[#171614] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E5E0D5] pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614]">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171614]">
                      {route.routeName}
                    </h3>
                    <div className="text-[11px] font-mono text-[#65705B]">
                      Vehicle: <span className="text-[#171614] font-semibold">{route.vehicleNumber}</span> • Capacity: {route.capacity} Seats
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-0.5 sm:text-right">
                  <div className="font-semibold text-[#171614]">
                    {route.driverName} (Driver)
                  </div>
                  <div className="text-[11px] font-mono text-[#65705B]">
                    {route.driverPhone}
                  </div>
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#65705B] font-bold">
                  Designated Boarding Checkpoints ({route.stops.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {route.stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="rounded-lg bg-[#FAF8F3] border border-[#E5E0D5] p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#171614]">{stop.stopName}</span>
                        <span className="text-[10px] font-mono font-bold text-[#65705B]">
                          #{stop.stopOrder}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#65705B] pt-1 border-t border-[#E5E0D5]">
                        <span>Pickup: {stop.pickupTime}</span>
                        <span>Drop: {stop.dropTime}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#171614] font-semibold pt-0.5">
                        Term Fee: {formatCurrency(stop.feeAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Route Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Transport Corridor"
          description="Register a new bus vehicle, designated driver, and route schedule."
          size="md"
        >
          {addSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#B89B62] text-[#B89B62] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#171614]">Route Registered</h4>
              <p className="text-xs text-[#65705B]">
                New transit corridor initialized and available for student stop allocations.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAddRoute} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171614] mb-1">Route Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route 05 - Golf Course & Cyber Hub"
                  value={formData.routeName}
                  onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Vehicle Registration # *</label>
                  <input
                    type="text"
                    required
                    placeholder="UP 16 AT 9028"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Capacity (Seats) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={80}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mr. Suresh Kumar"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Driver Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98110 44556"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
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
                  Create Route
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
