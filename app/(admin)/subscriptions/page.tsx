"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminApi,
  type SubscriptionBillingCycle,
  type SubscriptionRow,
} from "@/lib/api";
import { formatCurrency, getErrorMessage } from "@/lib/utils";

type PlanForm = {
  name: string;
  price: string;
  billingCycle: SubscriptionBillingCycle;
  title: string;
  includes: string;
};

const defaultPlan: PlanForm = {
  name: "",
  price: "",
  billingCycle: "monthly",
  title: "",
  includes: "",
};

function toLabelCycle(value: SubscriptionBillingCycle) {
  return value === "monthly" ? "Monthly" : "Yearly";
}

function toFormPlan(plan: SubscriptionRow): PlanForm {
  return {
    name: plan.name || "",
    price: String(plan.price ?? ""),
    billingCycle: plan.billingCycle,
    title: plan.title || "",
    includes: plan.includes || "",
  };
}

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [billingFilter, setBillingFilter] = useState<
    "" | SubscriptionBillingCycle
  >("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionRow | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionRow | null>(
    null,
  );
  const [isViewOpen, setViewOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [planForm, setPlanForm] = useState<PlanForm>(defaultPlan);

  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions-list", { page, limit, search, billingFilter }],
    queryFn: () =>
      adminApi.getSubscriptions({
        page,
        limit,
        search: search || undefined,
        billingCycle: billingFilter || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      price: number;
      billingCycle: SubscriptionBillingCycle;
      title: string;
      includes: string;
    }) => adminApi.createSubscription(payload),
    onSuccess: () => {
      toast.success("Subscription created successfully");
      setFormOpen(false);
      setPlanForm(defaultPlan);
      queryClient.invalidateQueries({ queryKey: ["subscriptions-list"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      subscriptionId,
      payload,
    }: {
      subscriptionId: string;
      payload: {
        name: string;
        price: number;
        billingCycle: SubscriptionBillingCycle;
        title: string;
        includes: string;
      };
    }) => adminApi.updateSubscription(subscriptionId, payload),
    onSuccess: () => {
      toast.success("Subscription updated successfully");
      setFormOpen(false);
      setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptions-list"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (subscriptionId: string) =>
      adminApi.deleteSubscription(subscriptionId),
    onSuccess: () => {
      toast.success("Subscription deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptions-list"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openCreateModal = () => {
    setFormMode("create");
    setPlanForm(defaultPlan);
    setSelectedPlan(null);
    setFormOpen(true);
  };

  const openEditModal = (plan: SubscriptionRow) => {
    setFormMode("edit");
    setSelectedPlan(plan);
    setPlanForm(toFormPlan(plan));
    setFormOpen(true);
  };

  const openViewModal = (plan: SubscriptionRow) => {
    setSelectedPlan(plan);
    setViewOpen(true);
  };

  const handleSubmitPlan = () => {
    const normalizedName = planForm.name.trim();
    const parsedPrice = Number(planForm.price);

    if (!normalizedName) {
      toast.error("Plan name is required");
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Valid price is required");
      return;
    }

    const payload = {
      name: normalizedName,
      price: parsedPrice,
      billingCycle: planForm.billingCycle,
      title: planForm.title.trim(),
      includes: planForm.includes.trim(),
    };

    if (formMode === "create") {
      createMutation.mutate(payload);
      return;
    }

    if (!selectedPlan?._id) {
      toast.error("Subscription not found");
      return;
    }

    updateMutation.mutate({
      subscriptionId: selectedPlan._id,
      payload,
    });
  };

  const rows = data?.subscriptions || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <Card>
        <CardContent className="p-4 lg:p-6">
          <PageHeader
            title="Subscription Management"
            breadcrumbs={["Dashboard", "Subscription Management"]}
            actions={
              <>
                <form
                  onSubmit={handleSearch}
                  className="flex w-full max-w-[340px] items-center"
                >
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
                <select
                  value={billingFilter}
                  onChange={(event) => {
                    setPage(1);
                    setBillingFilter(
                      event.target.value as "" | SubscriptionBillingCycle,
                    );
                  }}
                  className="h-11 rounded-md border border-slate-300 bg-white px-3 text-[14px] text-slate-700 outline-none focus:border-[#173a82]"
                >
                  <option value="">All Cycles</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <Button onClick={openCreateModal}>Create Plan</Button>
              </>
            }
          />

          {isLoading ? (
            <TableSkeleton cols={7} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Includes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-slate-500"
                        >
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <TableRow key={row._id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{toLabelCycle(row.billingCycle)}</TableCell>
                          <TableCell>{formatCurrency(row.price)}</TableCell>
                          <TableCell>{row.title || "-"}</TableCell>
                          <TableCell>{row.includes || "-"}</TableCell>
                          <TableCell>
                            {row.isActive ? (
                              <span className="text-green-600">Active</span>
                            ) : (
                              <span className="text-red-500">Inactive</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded-md p-1 text-[#173a82] hover:bg-slate-100"
                                onClick={() => openViewModal(row)}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="rounded-md p-1 text-amber-600 hover:bg-amber-50"
                                onClick={() => openEditModal(row)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                className="rounded-md p-1 text-red-500 hover:bg-red-50"
                                onClick={() => setDeleteTarget(row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setSelectedPlan(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan Details</DialogTitle>
          </DialogHeader>
          {selectedPlan ? (
            <div className="space-y-4 text-base text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Plan Name</p>
                <p>{selectedPlan.name}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Price</p>
                <p>{formatCurrency(selectedPlan.price)}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Billing Cycle</p>
                <p>{toLabelCycle(selectedPlan.billingCycle)}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Title</p>
                <p>{selectedPlan.title || "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  This Package Include
                </p>
                <p>{selectedPlan.includes || "-"}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedPlan(null);
            setPlanForm(defaultPlan);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Create Plan" : "Edit Plan"}
            </DialogTitle>
          </DialogHeader>
          <PlanFormView
            plan={planForm}
            setPlan={setPlanForm}
            onCancel={() => setFormOpen(false)}
            onSave={handleSubmitPlan}
            saving={isSaving}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              {deleteTarget?.name}
            </span>
            ?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget._id)
              }
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanFormView({
  plan,
  setPlan,
  onCancel,
  onSave,
  saving,
}: {
  plan: PlanForm;
  setPlan: (value: PlanForm) => void;
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-lg font-semibold">Plan Name</p>
          <Input
            value={plan.name}
            onChange={(event) => setPlan({ ...plan, name: event.target.value })}
            className="h-12"
            placeholder="Plan name"
          />
        </div>
        <div>
          <p className="mb-1 text-lg font-semibold">Price</p>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={plan.price}
            onChange={(event) =>
              setPlan({ ...plan, price: event.target.value })
            }
            className="h-12"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-lg font-semibold">Billing Cycle</p>
          <select
            value={plan.billingCycle}
            onChange={(event) =>
              setPlan({
                ...plan,
                billingCycle: event.target.value as SubscriptionBillingCycle,
              })
            }
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#173a82]"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <p className="mb-1 text-lg font-semibold">Title</p>
          <Input
            value={plan.title}
            onChange={(event) => setPlan({ ...plan, title: event.target.value })}
            className="h-12"
            placeholder="Plan title"
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-lg font-semibold">This Package Include</p>
        <Textarea
          value={plan.includes}
          onChange={(event) =>
            setPlan({ ...plan, includes: event.target.value })
          }
          className="min-h-24"
          placeholder="Describe what is included"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
