import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    {
      label: "Cards",
      icon: "style",
      href: "/flash-cards",
    },
    {
      label: "Tests",
      icon: "assignment",
      href: "/practice-test",
    },
    {
      label: "Saved",
      icon: "bookmark",
      href: "/saved-questions",
    },
    {
      label: "Upload",
      icon: "upload_file",
      href: "/upload-materials",
    },
    {
      label: "More",
      icon: "more_horiz",
      href: "/settings",
    },
  ];

  return (
    <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around items-center fixed bottom-0 left-0 right-0 z-10">
      {navItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          className={cn(
            "flex flex-col items-center py-3 px-4",
            location === item.href ? "text-primary-700" : "text-gray-500"
          )}
        >
          <span className="material-icons text-xl">{item.icon}</span>
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
