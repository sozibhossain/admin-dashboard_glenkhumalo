"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#eceef2]">
      <div className="flex h-full">
        {/* Mobile overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={[
            "fixed z-50 h-full w-[312px] transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar />
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <div className="shrink-0">
            <Topbar
              search=""
              setSearch={() => {}}
              placeholder="Search..."
              onMenuClick={() => setOpen((prev) => !prev)}
            />
          </div>

          {/* Page content scroll area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}