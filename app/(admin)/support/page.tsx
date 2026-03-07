"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCheck,
  Paperclip,
  Search,
  SendHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, type SupportTicketRow } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

type ThreadMessage = {
  id: string;
  side: "left" | "right";
  text: string;
  time: string;
};

function formatTimeAgo(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  return `${diffMin} min ago`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildThread(ticket: SupportTicketRow): ThreadMessage[] {
  const statusMessageMap: Record<string, string> = {
    open: "Thanks for contacting support. We received your ticket and will review it shortly.",
    in_progress: "We are currently working on this issue and will update you soon.",
    waiting_for_user: "Please provide additional details so we can continue.",
    resolved: ticket.resolution || "This issue has been resolved by support.",
    closed: ticket.resolution || "This ticket has been closed by support.",
  };

  const messageText = ticket.description || ticket.subject || "Support request";

  return [
    {
      id: `${ticket._id}-1`,
      side: "left",
      text: messageText,
      time: formatTime(ticket.createdAt),
    },
    {
      id: `${ticket._id}-2`,
      side: "right",
      text: statusMessageMap[ticket.status] || statusMessageMap.open,
      time: formatTime(ticket.updatedAt || ticket.createdAt),
    },
    {
      id: `${ticket._id}-3`,
      side: "left",
      text: messageText,
      time: formatTime(ticket.createdAt),
    },
    {
      id: `${ticket._id}-4`,
      side: "right",
      text: statusMessageMap[ticket.status] || statusMessageMap.open,
      time: formatTime(ticket.updatedAt || ticket.createdAt),
    },
  ];
}

function statusToNextAction(
  status: SupportTicketRow["status"],
): SupportTicketRow["status"] {
  if (status === "open") return "in_progress";
  if (status === "in_progress" || status === "waiting_for_user") {
    return "resolved";
  }
  if (status === "resolved") return "closed";
  return "in_progress";
}

function statusActionLabel(status: SupportTicketRow["status"]) {
  if (status === "open") return "Start Progress";
  if (status === "in_progress" || status === "waiting_for_user") {
    return "Mark Resolved";
  }
  if (status === "resolved") return "Close Ticket";
  return "Reopen";
}

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [resolutionDraft, setResolutionDraft] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets", { search }],
    queryFn: () =>
      adminApi.getSupportTickets({
        page: 1,
        limit: 100,
        search: search || undefined,
      }),
  });

  const selectedFromList = useMemo(
    () => data?.tickets.find((item) => item._id === selectedTicketId) || null,
    [data?.tickets, selectedTicketId],
  );

  const { data: ticketDetail } = useQuery({
    queryKey: ["support-ticket-detail", selectedTicketId],
    queryFn: () => adminApi.getSupportTicketById(selectedTicketId as string),
    enabled: Boolean(selectedTicketId),
  });

  const selectedTicket = ticketDetail || selectedFromList;
  const thread = selectedTicket ? buildThread(selectedTicket) : [];

  const updateStatusMutation = useMutation({
    mutationFn: (ticket: SupportTicketRow) =>
      adminApi.updateSupportTicketStatus(ticket._id, {
        status: statusToNextAction(ticket.status),
        resolution: resolutionDraft.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success("Ticket status updated");
      setResolutionDraft("");
      await queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      if (selectedTicketId) {
        await queryClient.invalidateQueries({
          queryKey: ["support-ticket-detail", selectedTicketId],
        });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const supportTickets = data?.tickets || [];

  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        {!selectedTicket ? (
          <div className="space-y-5">
            <PageHeader
              title="Support Massages"
              breadcrumbs={["Dashboard", "Support Massages"]}
              actions={
                <form
                  onSubmit={handleSearch}
                  className="flex w-full max-w-[430px] items-center"
                >
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by Category Name"
                    className="h-11 rounded-r-none border-r-0 text-[14px] shadow-none"
                  />
                  <Button
                    type="submit"
                    className="h-11 w-[72px] rounded-l-none rounded-r-md bg-[#173a82] px-0 hover:bg-[#122f6a]"
                  >
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </form>
              }
            />

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {supportTickets.length === 0 ? (
                  <p className="py-10 text-center text-slate-500">
                    No support messages found.
                  </p>
                ) : (
                  supportTickets.map((ticket) => {
                    const unreadCount =
                      ticket.status === "open" || ticket.status === "in_progress"
                        ? 2
                        : 0;

                    return (
                      <button
                        key={ticket._id}
                        onClick={() => setSelectedTicketId(ticket._id)}
                        className="grid w-full grid-cols-[minmax(0,1fr)_110px] items-start gap-3 rounded-lg p-3 text-left transition hover:bg-slate-100"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={ticket.user?.profileImage?.url}
                            name={ticket.user?.name || "User"}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[16px] font-semibold text-[#1b2333]">
                              {ticket.user?.name || "Unknown User"}
                            </p>
                            <p className="truncate text-[15px] text-slate-600">
                              {ticket.description || ticket.subject}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1 text-right">
                          <span className="text-sm text-slate-600">
                            {formatTimeAgo(ticket.createdAt)}
                          </span>
                          {unreadCount > 0 ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef3838] px-1 text-[10px] font-semibold text-white">
                              {String(unreadCount).padStart(2, "0")}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => setSelectedTicketId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Messages
              </button>
              <Button
                variant="outline"
                onClick={() =>
                  selectedTicket && updateStatusMutation.mutate(selectedTicket)
                }
                disabled={updateStatusMutation.isPending}
              >
                {statusActionLabel(selectedTicket.status)}
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-3">
                <Avatar
                  src={selectedTicket.user?.profileImage?.url}
                  name={selectedTicket.user?.name || "User"}
                />
                <div>
                  <h3 className="text-[24px] font-semibold text-[#1b2333]">
                    {selectedTicket.user?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedTicket.subject} - {selectedTicket.category}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {thread.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.side === "right" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={[
                        "w-full max-w-[58%] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
                        item.side === "right" ? "ml-auto" : "mr-auto",
                      ].join(" ")}
                    >
                      <p className="text-[16px] text-[#1d1d1d]">{item.text}</p>
                      <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                        <span>{item.time}</span>
                        {item.side === "right" ? (
                          <CheckCheck className="h-4 w-4 text-[#213d6d]" />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-[#f6f7f9] p-3">
                <div className="mb-3">
                  <Input
                    value={resolutionDraft}
                    onChange={(event) => setResolutionDraft(event.target.value)}
                    placeholder="Resolution note (optional)"
                    className="h-10 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <Input
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Type a messages"
                    className="h-10 bg-white"
                  />
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#173a82] text-white hover:bg-[#122f6a]"
                    onClick={() =>
                      toast.info(
                        "Message send API is not available in support routes yet.",
                      )
                    }
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
