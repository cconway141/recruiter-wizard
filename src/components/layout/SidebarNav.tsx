
import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { UserNavButton } from "./UserNavButton";

export function SidebarNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex flex-col space-y-3", className)}>
      {siteConfig.sidebarNav.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {item.title}
        </Link>
      ))}
      <div className="mt-4">
        <UserNavButton />
      </div>
    </nav>
  );
}
