"use client";

import React, { useState } from "react";
import { Megaphone, Plus, Calendar, User, Sparkles, Send, Search, Filter } from "lucide-react";
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
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Circulars</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{announcements.length}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Published this session</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Parent Notices</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {announcements.filter((a) => a.targetAudience === "PARENTS" || a.targetAudience === "EVERYONE").length}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">Active guardian dispatches</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Staff Directives</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {announcements.filter((a) => a.targetAudience === "TEACHERS").length}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">Internal faculty memos</div>
        </div>
        <div className="rounded-xl border border-[#E8E7DF] bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Delivery Channels</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">App + WhatsApp</div>
          <div className="mt-0.5 text-[11px] text-slate-500">Multi-point synchronization</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E8E7DF] bg-white p-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars, directives, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E7DF] bg-[#FAF9F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          {["ALL", "EVERYONE", "PARENTS", "TEACHERS", "STUDENTS"].map((aud) => (
            <button
              key={aud}
              onClick={() => setAudienceFilter(aud)}
              className={`px-2.5 py-1 text-xs font-mono uppercase rounded-md transition-colors ${
                audienceFilter === aud
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {aud}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className="rounded-xl border border-[#E8E7DF] bg-white p-5 shadow-2xs space-y-3 hover:border-slate-400 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E7DF] pb-3">
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
              <span className="text-[11px] font-mono text-slate-400">
                Published {formatDate(ann.publishedAt, "dd MMM yyyy, HH:mm")}
              </span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {ann.title}
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-normal">
                {ann.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E8E7DF] text-[11px]">
              <span className="text-slate-400 font-mono">Issued by: <span className="text-slate-700 font-medium">{ann.authorName}</span></span>
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
                className="text-slate-900 hover:text-slate-700 font-mono font-semibold flex items-center gap-1 transition-colors"
              >
                <Send className="h-3 w-3" />
                WhatsApp Broadcast Dispatch →
              </button>
            </div>
          </div>
        ))}
      </div>

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
