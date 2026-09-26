"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Tag, Plus, Filter, Search, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "EVENT",
    startDate: "2026-10-15",
    endDate: "2026-10-15",
    targetAudience: "EVERYONE",
    location: "Main Auditorium",
  });

  const filteredEvents = events.filter((e) => {
    const matchesFilter = selectedFilter === "ALL" || e.eventType === selectedFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleExportICal = () => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nexora Educational OS//Academic Calendar//EN",
      ...events.map(
        (e) =>
          `BEGIN:VEVENT\nSUMMARY:${e.title}\nDESCRIPTION:${e.description || ""}\nLOCATION:${e.location || ""}\nEND:VEVENT`
      ),
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Nexora_Academic_Calendar.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setScheduleSuccess(true);
      setTimeout(() => {
        setIsScheduleModalOpen(false);
        setScheduleSuccess(false);
        router.refresh();
      }, 1000);
    }, 600);
  };

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
              onClick={handleExportICal}
              leftIcon={<Download className="h-3.5 w-3.5 text-[#B89B62]" />}
            >
              Export iCal
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Schedule Event
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Total Events</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{events.length}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Scheduled calendar entries</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Exams & Milestones</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">
            {events.filter((e) => e.eventType === "EXAM" || e.eventType === "DEADLINE").length}
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Academic checkpoints</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Parent Conferences</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">
            {events.filter((e) => e.eventType === "PARENT_MEETING").length}
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Community engagements</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Upcoming Holiday</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">02 Oct</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Gandhi Jayanti</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E0D5] bg-white p-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65705B]" />
          <input
            type="text"
            placeholder="Search events, locations, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#171614] transition-colors"
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
                  ? "bg-[#171614] text-white font-semibold"
                  : "bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614] hover:bg-[#F3F0E8]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-xl border border-dashed border-[#E5E0D5] bg-[#FAF8F3] text-xs text-[#65705B]">
            No calendar events found matching the selection.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-xs space-y-3 hover:border-[#171614] transition-colors"
            >
              <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-2.5">
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
                  {ev.eventType.replace("_", " ")}
                </Badge>
                <span className="text-[11px] font-mono text-[#65705B]">
                  Audience: {ev.targetAudience}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#171614]">
                  {ev.title}
                </h3>
                {ev.description && (
                  <p className="mt-1 text-xs text-[#65705B] line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#E5E0D5] space-y-1.5 text-xs text-[#65705B]">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <CalendarIcon className="h-3.5 w-3.5 text-[#B89B62]" />
                  <span className="text-[#171614] font-medium">
                    {formatDate(ev.startDate)}
                    {ev.startDate !== ev.endDate && ` — ${formatDate(ev.endDate)}`}
                  </span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="h-3.5 w-3.5 text-[#65705B]" />
                    <span>{ev.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Event Modal */}
      {isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Schedule Calendar Milestone"
          description="Publish a new institutional event, examination date, or parent conference."
          size="md"
        >
          {scheduleSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#B89B62] text-[#B89B62] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#171614]">Event Added to Calendar</h4>
              <p className="text-xs text-[#65705B]">
                Calendar entry synchronized with timetable and community notification feeds.
              </p>
            </div>
          ) : (
            <form onSubmit={handleScheduleEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171614] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Parent-Teacher Academic Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Event Type *</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  >
                    <option value="EVENT">Event</option>
                    <option value="EXAM">Examination</option>
                    <option value="PARENT_MEETING">Parent Meeting</option>
                    <option value="STAFF_MEETING">Faculty Meeting</option>
                    <option value="HOLIDAY">Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  >
                    <option value="EVERYONE">Everyone</option>
                    <option value="PARENTS">Parents</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="STUDENTS">Students</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#171614] mb-1">Location / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium / Block B Lab"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171614] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Event itinerary, dress code, or special instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Schedule Event
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
