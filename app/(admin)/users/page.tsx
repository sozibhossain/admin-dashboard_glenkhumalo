"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, type UserRow } from "@/lib/api";
import { formatDate, getErrorMessage } from "@/lib/utils";

function statusClass(status: string) {
  if (status === "approved") return "bg-green-100 text-green-600";
  if (status === "suspended") return "bg-red-100 text-red-600";
  if (status === "rejected") return "bg-amber-100 text-amber-600";
  return "bg-slate-100 text-slate-600";
}

function formatDialogDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UserRow | null>(null);
  const [successTarget, setSuccessTarget] = useState<UserRow | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<Record<string, boolean>>({});

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: () => adminApi.getUsers({ page, limit, search }),
  });

  const stats = useMemo(() => {
    const rows = data?.users || [];
    return {
      total: rows.length,
      active: rows.filter((row) => row.accountStatus === "approved").length,
      inactive: rows.filter((row) => row.accountStatus !== "approved").length,
    };
  }, [data?.users]);

  const blockMutation = useMutation({
    mutationFn: (target: UserRow) => adminApi.blockUser(target._id),
    onSuccess: (_, target) => {
      setBlockedUsers((prev) => ({ ...prev, [target._id]: true }));
      setConfirmTarget(null);
      setSuccessTarget(target);
      toast.success("User blocked successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error, target) => {
      const message = getErrorMessage(error);
      if (message.toLowerCase().includes("already blocked")) {
        setBlockedUsers((prev) => ({ ...prev, [target._id]: true }));
        setConfirmTarget(null);
        setSuccessTarget(target);
        return;
      }
      toast.error(message);
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (target: UserRow) => adminApi.unblockUser(target._id),
    onSuccess: (_, target) => {
      setBlockedUsers((prev) => ({ ...prev, [target._id]: false }));
      setSuccessTarget(null);
      toast.success("User unblocked successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const isBlocked = (user: UserRow) => Boolean(blockedUsers[user._id]);

  return (
    <div>
      <div>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2 text-base text-slate-500">
              Total Visitors
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.total}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 text-base text-slate-500">
              Total Users
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.active}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 text-base text-slate-500">
              App Download
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.inactive}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <PageHeader
              title="User Management"
              breadcrumbs={["Dashboard", "User Management"]}
              actions={
                <form onSubmit={handleSearch} className="flex w-full max-w-[340px] items-center">
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by Category Name"
                    className="h-11 rounded-r-none border-r-0 text-[14px] shadow-none"
                  />
                  <Button
                    type="submit"
                    className="h-11 w-[52px] rounded-l-none rounded-r-md bg-[#173a82] px-0 hover:bg-[#122f6a]"
                  >
                    <Search className="h-4 w-4 text-white" />
                  </Button>
                </form>
              }
            />

            {isLoading ? (
              <TableSkeleton cols={8} rows={10} />
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined On</TableHead>
                        <TableHead>App Download</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={user.profileImage?.url}
                                name={user.name}
                              />
                              <span>{user.name || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.address || "-"}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-amber-500">
                            {user.phone ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusClass(user.accountStatus)}>
                              {user.accountStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-md p-1 text-red-500 hover:bg-red-50"
                                onClick={() => setConfirmTarget(user)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                              <button
                                className="rounded-md p-1 text-[#173a82] hover:bg-slate-100"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <PaginationBar
                  page={page}
                  totalPages={data?.pagination.totalPages ?? 1}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setPage(1);
                    setLimit(newLimit);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 border-0 bg-white p-8 sm:max-w-[750px] sm:rounded-[40px] sm:p-20 shadow-2xl"
        >

          {selectedUser ? (
            <div className="space-y-12">
              {/* Profile Image Section */}
              <div className="mx-auto w-fit">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-100">
                  <Avatar
                    src={selectedUser.profileImage?.url}
                    name={selectedUser.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 gap-x-20 gap-y-12 sm:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-10">
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Name</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {selectedUser.name || "Aliana"}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">
                      Location
                    </p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {selectedUser.address || "Manchester, UK"}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Email</p>
                    <p className="mt-2 break-all font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {selectedUser.email || "example@gmail.com"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-10">
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">
                      Phone Number
                    </p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {selectedUser.phone || "+02425584"}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">
                      Registration Date
                    </p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {formatDialogDate(selectedUser.createdAt) || "02/01/2024"}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">
                      Account Status
                    </p>
                    <p
                      className={`mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] ${
                        !isBlocked(selectedUser) && selectedUser.accountStatus === "approved"
                          ? "text-[#36e36d]"
                          : "text-[#1d1d1d]"
                      }`}
                    >
                      {!isBlocked(selectedUser) && selectedUser.accountStatus === "approved"
                        ? "Active"
                        : "Blocked"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  className="h-14 w-full rounded-xl bg-[#eb4335] font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-white transition-all hover:bg-[#d63d2f]"
                  onClick={() => {
                    setSelectedUser(null);
                    if (isBlocked(selectedUser)) {
                      setSuccessTarget(selectedUser);
                      return;
                    }
                    setConfirmTarget(selectedUser);
                  }}
                >
                  {isBlocked(selectedUser) ? "Unblock account" : "Block account"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(confirmTarget)}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="border-0 bg-[#efefef] p-5 sm:max-w-[760px] sm:rounded-2xl sm:p-7"
        >
          <DialogHeader className="text-center">
            <DialogTitle className="font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="pt-2 font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">
              Want to block this account. Remember if you block him he can&apos;t give any services.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 rounded-xl border-[#213d6d] bg-transparent font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d] hover:bg-slate-100"
              onClick={() => setConfirmTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-14 rounded-xl bg-[#ef3838] font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-white hover:bg-[#e53131]"
              onClick={() => confirmTarget && blockMutation.mutate(confirmTarget)}
              disabled={blockMutation.isPending}
            >
              Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(successTarget)}
        onOpenChange={(open) => !open && setSuccessTarget(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="border-0 bg-[#efefef] p-5 sm:max-w-[760px] sm:rounded-2xl sm:p-7"
        >
          <DialogHeader className="text-center">
            <DialogTitle className="font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
              You have successfully block this person
            </DialogTitle>
          </DialogHeader>
          <Button
            className="mt-2 h-14 rounded-xl bg-[#dddddd] font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d] hover:bg-[#d5d5d5]"
            onClick={() => successTarget && unblockMutation.mutate(successTarget)}
            disabled={unblockMutation.isPending}
          >
            Unblock
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}


