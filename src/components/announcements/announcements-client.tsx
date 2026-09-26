"use client";

import React, { useState } from "react";
import { Megaphone, Plus, Calendar, User, Sparkles, Send, Search, Filter, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { WhatsAppPreviewModal } from "@/components/ui/whatsapp-preview-modal";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  publishedAt: Date | string;
  authorName: string;
}

export function AnnouncementsClient({
  announcements,
  canCreate,
}: {
  announcements: AnnouncementItem[];
  canCreate: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<any>(null);
  const [audienceFilter, setAudienceFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "EVERYONE",
    priority: "NORMAL",
  });

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesAudience = audienceFilter === "ALL" || ann.targetAudience === audienceFilter;
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAudience && matchesSearch;
  });

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCreateSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setCreateSuccess(false);
        router.refresh();
      }, 1000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Institutional Communications"
        title="Announcements & Circulars"
        description="Official broadcasts, policy notices, event bulletins, and multi-channel parent dispatches."
        actions={
          <div className="flex items-center gap-2">
            {canCreate && (
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                New Circular
              </Button>
            )}
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Total Circulars</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">{announcements.length}</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Published this session</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Parent Notices</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">
            {announcements.filter((a) => a.targetAudience === "PARENTS" || a.targetAudience === "EVERYONE").length}
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Active guardian dispatches</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Staff Directives</div>
          <div className="mt-1 text-2xl font-bold text-[#171614]">
            {announcements.filter((a) => a.targetAudience === "TEACHERS").length}
          </div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Internal faculty memos</div>
        </div>
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-4 shadow-xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#65705B]">Delivery Channels</div>
          <div className="mt-1 text-2xl font-bold text-[#65705B]">App + WhatsApp</div>
          <div className="mt-0.5 text-[11px] text-[#65705B]">Multi-point synchronization</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E0D5] bg-white p-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#65705B]" />
          <input
            type="text"
            placeholder="Search circulars, directives, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#171614] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          {["ALL", "EVERYONE", "PARENTS", "TEACHERS", "STUDENTS"].map((aud) => (
            <button
              key={aud}
              onClick={() => setAudienceFilter(aud)}
              className={`px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                audienceFilter === aud
                  ? "bg-[#171614] text-white font-semibold"
                  : "bg-[#FAF8F3] border border-[#E5E0D5] text-[#171614] hover:bg-[#F3F0E8]"
              }`}
            >
              {aud}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#E5E0D5] bg-[#FAF8F3] text-xs text-[#65705B]">
            No announcements found matching your criteria.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-xs space-y-3 hover:border-[#171614] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E0D5] pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {ann.targetAudience}
                  </Badge>
                  {ann.priority === "URGENT" ? (
                    <Badge variant="danger" size="sm">
                      URGENT
                    </Badge>
                  ) : ann.priority === "HIGH" ? (
                    <Badge variant="warning" size="sm">
                      HIGH
                    </Badge>
                  ) : null}
                </div>
                <span className="text-[11px] font-mono text-[#65705B]">
                  Published {formatDate(ann.publishedAt, "dd MMM yyyy, HH:mm")}
                </span>
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#171614]">
                  {ann.title}
                </h2>
                <p className="mt-1.5 text-xs text-[#171614] leading-relaxed font-normal">
                  {ann.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D5] text-[11px]">
                <span className="text-[#65705B] font-mono">Issued by: <span className="text-[#171614] font-medium">{ann.authorName}</span></span>
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppData({
                      recipientName: "Northstar Parent Broadcast Network",
                      recipientPhone: "+91 98100 11005",
                      templateTitle: ann.title,
                      messageContent: `${ann.content}\n\n- Northstar International Academy`,
                    });
                    setIsWhatsAppOpen(true);
                  }}
                  className="text-[#171614] hover:text-[#B89B62] font-mono font-semibold flex items-center gap-1 transition-colors"
                >
                  <Send className="h-3 w-3" />
                  WhatsApp Broadcast Dispatch →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Circular Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Publish Institutional Circular"
          description="Draft and dispatch an official announcement across student, parent, and faculty portals."
          size="md"
        >
          {createSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#B89B62] text-[#B89B62] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#171614]">Circular Dispatched</h4>
              <p className="text-xs text-[#65705B]">
                Announcement is now live across targeted portal dashboards and mobile push channels.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#171614] mb-1">Circular Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Annual Science & Robotics Conclave 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  >
                    <option value="EVERYONE">Everyone (Public)</option>
                    <option value="PARENTS">Parents Only</option>
                    <option value="TEACHERS">Faculty & Staff</option>
                    <option value="STUDENTS">Scholars & Students</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#171614] mb-1">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614]"
                  >
                    <option value="NORMAL">Normal Notice</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#171614] mb-1">Circular Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed notice body, guidelines, schedules, or parental instructions..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E0D5] bg-[#FAF8F3] p-2.5 text-xs text-[#171614] focus:outline-none focus:ring-1 focus:ring-[#171614]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E0D5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Publish Circular
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* WhatsApp Modal */}
      {isWhatsAppOpen && whatsAppData && (
        <WhatsAppPreviewModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          recipientName={whatsAppData.recipientName}
          recipientPhone={whatsAppData.recipientPhone}
          templateTitle={whatsAppData.templateTitle}
          messageContent={whatsAppData.messageContent}
        />
      )}
    </div>
  );
}
