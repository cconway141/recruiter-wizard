
import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {siteConfig.mainNav.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="px-2 py-1.5 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
