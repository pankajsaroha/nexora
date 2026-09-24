"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Tag, Plus, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string | null;
  eventType: "EXAM" | "HOLIDAY" | "PARENT_MEETING" | "STAFF_MEETING" | "EVENT" | "DEADLINE";
  startDate: Date | string;
  endDate: Date | string;
  targetAudience: string;
  location?: string | null;
}

export function CalendarClient({ events }: { events: CalendarEventItem[] }) {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter((e) => {
    const matchesFilter = selectedFilter === "ALL" || e.eventType === selectedFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        category="Schedule & Institutional Timeline"
        title="Calendar & Academic Events"
        description="Term dates, examination blocks, parent-teacher conferences, and institutional holidays."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Calendar export / iCal sync initiated.")}
            >
              Export iCal
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => alert("Add Event modal will open.")}
            >
              Schedule Event
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Events</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{events.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Scheduled calendar entries</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Exams & Milestones</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {events.filter((e) => e.eventType === "EXAM" || e.eventType === "DEADLINE").length}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">Academic checkpoints</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Parent Conferences</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {events.filter((e) => e.eventType === "PARENT_MEETING").length}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">Community engagements</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Upcoming Holiday</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">02 Oct</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Gandhi Jayanti</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E8E7DF] bg-white p-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, locations, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          {[
            { key: "ALL", label: "All" },
            { key: "EXAM", label: "Exams" },
            { key: "PARENT_MEETING", label: "Parent Meets" },
            { key: "HOLIDAY", label: "Holidays" },
            { key: "EVENT", label: "Events" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedFilter(item.key)}
              className={`px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                selectedFilter === item.key
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-3 hover:border-slate-400 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[#E8E7DF] pb-2.5">
              <Badge
                variant={
                  ev.eventType === "EXAM"
                    ? "danger"
                    : ev.eventType === "HOLIDAY"
                    ? "warning"
                    : ev.eventType === "PARENT_MEETING"
                    ? "info"
                    : "outline"
                }
                size="sm"
              >
                {ev.eventType}
              </Badge>
              <span className="text-[11px] font-mono text-slate-400">
                Audience: {ev.targetAudience}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {ev.title}
              </h3>
              {ev.description && (
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-[#E8E7DF] space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-800 font-medium">
                  {formatDate(ev.startDate)}
                  {ev.startDate !== ev.endDate && ` — ${formatDate(ev.endDate)}`}
                </span>
              </div>
              {ev.location && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{ev.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
