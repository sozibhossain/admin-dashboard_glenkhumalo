"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { getErrorMessage } from "@/lib/utils";

const fixedClientDialogData = {
  phone: "+02463245",
  location: "London,UK",
  joiningDate: "15/03/2024",
  totalOrders: "12",
  totalAmountSpent: "\u00A33,480",
  disputesRaised: "2",
  accountStatus: "Active",
};

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

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UserRow | null>(null);
  const [successTarget, setSuccessTarget] = useState<UserRow | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const { data, isLoading } = useQuery({
    queryKey: ["clients", { page, limit, search }],
    queryFn: () => adminApi.getUsers({ page, limit, search, role: "client" }),
  });

  const blockMutation = useMutation({
    mutationFn: (target: UserRow) => adminApi.blockUser(target._id),
    onSuccess: (_, target) => {
      setBlockedUsers((prev) => ({ ...prev, [target._id]: true }));
      setConfirmTarget(null);
      setSuccessTarget(target);
      toast.success("User blocked successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
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
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const isBlocked = (user: UserRow) => Boolean(blockedUsers[user._id]);

  return (
    <div>
      <div>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <PageHeader
              title="Client Management"
              breadcrumbs={["Dashboard", "Client Management"]}
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
              <TableSkeleton cols={5} />
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Total Order</TableHead>
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
                              <span>{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "-"}</TableCell>
                          <TableCell>0</TableCell>
                          <TableCell>
                            <button
                              className="rounded-full border border-green-500 px-3 py-1 text-green-600"
                              onClick={() => setSelected(user)}
                            >
                              Details
                            </button>
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
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 border-0 bg-white p-8 sm:max-w-[750px] sm:rounded-[40px] sm:p-20 shadow-2xl"
        >
          {selected ? (
            <div className="space-y-10">
              <div className="mx-auto w-fit">
                <Avatar
                  src={selected.profileImage?.url}
                  name={selected.name}
                  className="h-[68px] w-[68px]"
                />
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-16">
                <div className="space-y-8">
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Name</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {selected.name || "Paris Dimension"}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Location</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {selected.address || fixedClientDialogData.location}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Total Orders</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {fixedClientDialogData.totalOrders}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Disputes Raised</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {fixedClientDialogData.disputesRaised}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Phone Number</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {selected.phone || fixedClientDialogData.phone}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Joining Date</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {formatDialogDate(selected.createdAt) || fixedClientDialogData.joiningDate}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Total Amount Spent</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {fixedClientDialogData.totalAmountSpent}
                    </p>
                  </div>
                  <div>
                    <p className="font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-[#1d1d1d]">Account Status</p>
                    <p className="mt-2 font-[var(--font-outfit)] text-[24px] font-semibold leading-[120%] text-[#1d1d1d]">
                      {isBlocked(selected) ? "Blocked" : fixedClientDialogData.accountStatus}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                className="h-14 w-full rounded-xl bg-[#ef3838] font-[var(--font-outfit)] text-[16px] font-normal leading-[120%] text-white hover:bg-[#e53131]"
                onClick={() => {
                  setSelected(null);
                  if (isBlocked(selected)) {
                    setSuccessTarget(selected);
                    return;
                  }
                  setConfirmTarget(selected);
                }}
              >
                {isBlocked(selected) ? "Unblock account" : "Block account"}
              </Button>
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


