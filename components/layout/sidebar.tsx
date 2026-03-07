"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Sparkles,
  HandCoins,
  Wallet,
  ShieldCheck,
  Globe,
  Headset,
  Settings,
  LogOut,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { userApi } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  clients: UserRound,
  creatives: Sparkles,
  revenue: HandCoins,
  payments: Wallet,
  subscriptions: Wallet,
  verification: ShieldCheck,
  website: Globe,
  support: Headset,
  settings: Settings,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: userApi.getMyProfile,
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);

    

    // ✅ NextAuth logout
    await signOut({
      callbackUrl: "/auth/login", // তোমার login route যা হবে
      redirect: true,
    });
  };

  return (
    <>
      <aside className="flex h-full w-[312px] min-w-[312px] shrink-0 flex-col border-r border-slate-100 bg-white p-6 font-[var(--font-outfit)]">
        {/* Logo Section */}
        <div className="mb-10 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Solace logo"
            width={500}
            height={500}
            className="h-[57px] w-[264px]"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon =
              iconMap[item.key as keyof typeof iconMap] || LayoutDashboard;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-[16px] font-normal leading-[120%] tracking-[0] transition-all",
                  isActive
                    ? "bg-[#112d6a] !text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-slate-500"
                  )}
                />
                <span className={cn(isActive ? "text-white" : "text-slate-700")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: Profile & Logout */}
        <div className="mt-auto border-t border-slate-50 pt-6">
          <div className="mb-6 flex items-center gap-3">
            <Avatar
              className="h-12 w-12"
              name={session?.user?.name || "Glen Khumalo"}
              src={profile?.profileImage?.url}
            />
            <div className="flex flex-col">
              <span className="text-[16px] font-normal leading-[120%] tracking-[0] text-slate-900">
                {session?.user?.name || "Glen Khumalo"}
              </span>
              <span className="text-[16px] font-normal leading-[120%] tracking-[0] text-slate-500">
                {session?.user?.role || "Glen Khumalo"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-100 py-3 text-[16px] font-normal leading-[120%] tracking-[0] text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 rotate-180" />
            Log out
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account? You will need to
              sign in again to access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1"
            >
              No, Stay
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
