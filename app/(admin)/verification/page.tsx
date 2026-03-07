"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";

export default function VerificationPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["verification", { page, limit }],
    queryFn: () =>
      adminApi.getVerificationRequests({ page, limit, status: "pending" }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "approve" | "reject";
    }) =>
      adminApi.reviewVerification(id, {
        action,
        rejectionReason: action === "reject" ? "Rejected by admin" : undefined,
      }),
    onSuccess: () => {
      toast.success("Verification updated");
      queryClient.invalidateQueries({ queryKey: ["verification"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const rows = (data?.verifications || []).filter((row) => {
    const query = search.toLowerCase();
    return (
      row.creative?.name?.toLowerCase().includes(query) ||
      row.creative?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div>
        <Card>
          <CardContent className="p-6">
            <PageHeader
              title="Verification"
              breadcrumbs={["Dashboard", "Creative Management"]}
              actions={
                <>
                  <Button variant="outline">Edit Plan</Button>
                  <Button variant="outline">Create Plan</Button>
                </>
              }
            />

            {isLoading ? (
              <TableSkeleton cols={6} />
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Creative Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={row.creative?.profileImage?.url}
                                name={row.creative?.name}
                              />
                              <span>{row.creative?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{row.creative?.email}</TableCell>
                          <TableCell>
                            {formatCurrency(row.paymentAmount)}
                          </TableCell>
                          <TableCell>
                            {row.description || "Creative service"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                className="text-green-500"
                                onClick={() =>
                                  reviewMutation.mutate({
                                    id: row._id,
                                    action: "approve",
                                  })
                                }
                              >
                                <Check className="h-6 w-6" />
                              </button>
                              <button
                                className="text-red-500"
                                onClick={() =>
                                  reviewMutation.mutate({
                                    id: row._id,
                                    action: "reject",
                                  })
                                }
                              >
                                <Trash2 className="h-6 w-6" />
                              </button>
                              <Link
                                href={`/verification/${row._id}`}
                                className="text-[#173a82]"
                              >
                                <Eye className="h-6 w-6" />
                              </Link>
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
    </div>
  );
}
