"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "@/common/sidebar";
import Header from "@/common/header";

/**
 * The console shell: fixed sidebar, sticky header, and the page in the content
 * column. Client-side only because it owns the mobile drawer's open state —
 * `children` is still rendered on the server and passed in.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-[250px]">
        <div className="sticky top-0 z-20">
          <Header setSidebarOpen={setSidebarOpen} />
        </div>
        <main className="mx-auto space-y-6 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
