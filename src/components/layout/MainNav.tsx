
import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex items-center space-x-4", className)}>
      {siteConfig.mainNav.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
