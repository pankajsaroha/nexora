"use client";

import React, { useState } from "react";
import { Modal } from "./modal";
import { Badge } from "./badge";
import { Button } from "./button";
import { CheckCheck, MessageSquare, Send, Sparkles, AlertCircle } from "lucide-react";

export interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone: string;
  templateTitle: string;
  messageContent: string;
  onSimulateSend?: () => void;
}

export function WhatsAppPreviewModal({
  isOpen,
  onClose,
  recipientName,
  recipientPhone,
  templateTitle,
  messageContent,
  onSimulateSend,
}: WhatsAppPreviewModalProps) {
  const [status, setStatus] = useState<"IDLE" | "QUEUED" | "DELIVERED">("IDLE");
  const [isSending, setIsSending] = useState(false);

  const handleSimulate = async () => {
    setIsSending(true);
    setStatus("QUEUED");
    if (onSimulateSend) {
      await onSimulateSend();
    }
    setTimeout(() => {
      setStatus("DELIVERED");
      setIsSending(false);
    }, 900);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="WhatsApp Notification Simulation"
      description="Preview how this institutional alert appears to recipients via WhatsApp (PingStack integration ready)."
      size="md"
    >
      <div className="space-y-4">
        {/* Banner */}
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Mock WhatsApp Dispatcher
            </span>
          </div>
          <Badge variant="success" size="sm">
            PingStack Ready
          </Badge>
        </div>

        {/* WhatsApp Phone Mockup Window */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#e5ddd5] dark:bg-slate-950 p-4 shadow-inner">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-[#075e54] p-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                NX
              </div>
              <div>
                <div className="text-xs font-semibold leading-none">
                  Nexora Institutional Alert
                </div>
                <div className="text-[10px] text-emerald-100 mt-0.5">
                  Verified Institution Account
                </div>
              </div>
            </div>
            <span className="text-[10px] text-emerald-200">
              {recipientName} ({recipientPhone})
            </span>
          </div>

          {/* Chat Bubble */}
          <div className="mt-3 flex justify-start">
            <div className="relative max-w-[85%] rounded-lg bg-white dark:bg-slate-900 p-3 shadow-sm border border-slate-200/50 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100">
              <div className="mb-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                {templateTitle}
              </div>
              <p className="whitespace-pre-line leading-relaxed">{messageContent}</p>
              <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                <span>10:45 AM</span>
                {status === "DELIVERED" ? (
                  <CheckCheck className="h-3 w-3 text-sky-500" />
                ) : (
                  <CheckCheck className="h-3 w-3 text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-850 p-3 text-xs">
          <span className="text-slate-500">Delivery Status:</span>
          {status === "IDLE" && (
            <Badge variant="neutral" size="sm">
              Ready to Dispatch
            </Badge>
          )}
          {status === "QUEUED" && (
            <Badge variant="warning" size="sm">
              Queued for Simulation...
            </Badge>
          )}
          {status === "DELIVERED" && (
            <Badge variant="success" size="sm">
              ✓ Delivered & Logged in Audit
            </Badge>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={handleSimulate}
            isLoading={isSending}
            leftIcon={<Send className="h-3.5 w-3.5" />}
          >
            {status === "DELIVERED" ? "Simulate Again" : "Queue & Simulate"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
