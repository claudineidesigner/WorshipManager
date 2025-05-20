import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const MobileNav: React.FC = () => {
  const [location] = useLocation();
  
  const navItems = [
    { name: "Home", path: "/", icon: "fa-home" },
    { name: "Schedule", path: "/schedule", icon: "fa-calendar-alt" },
    { name: "Songs", path: "/songs", icon: "fa-music" },
    { name: "Team", path: "/team", icon: "fa-users" },
    { name: "Chat", path: "/messages", icon: "fa-comments" },
  ];
  
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10 flex lg:hidden">
      <div className="flex-1 flex justify-between">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex-1 inline-flex flex-col items-center justify-center py-3 hover:bg-gray-50 text-sm font-medium",
              location === item.path
                ? "text-primary"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <i 
              className={cn(
                `fas ${item.icon} text-lg mb-1`,
                location === item.path ? "text-primary" : "text-gray-400"
              )}
            ></i>
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
