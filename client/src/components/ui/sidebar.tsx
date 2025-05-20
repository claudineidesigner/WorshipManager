import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const logout = useLogout();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: "fa-home" },
    { name: "Schedule", path: "/schedule", icon: "fa-calendar-alt" },
    { name: "Songs", path: "/songs", icon: "fa-music" },
    { name: "Team", path: "/team", icon: "fa-users" },
    { name: "Messages", path: "/messages", icon: "fa-comments" },
  ];
  
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5">
      <div className="flex items-center flex-shrink-0 px-6">
        <img 
          src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
          alt="Harmony logo" 
          className="h-8 w-8 rounded-md"
        />
        <span className="ml-2 text-primary font-semibold text-xl">Harmony</span>
      </div>
      
      <div className="mt-6 h-0 flex-1 flex flex-col overflow-y-auto">
        <div className="px-3 mt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            MAIN MENU
          </h3>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === item.path
                    ? "bg-primary-50 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <i 
                  className={cn(
                    `fas ${item.icon} mr-3 text-lg`,
                    location === item.path
                      ? "text-primary"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                ></i>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 mt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            YOUR MINISTRY
          </h3>
          <div className="mt-2 space-y-1">
            <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <i className="fas fa-church mr-3 text-lg text-gray-400 group-hover:text-gray-500"></i>
              ICB IGUA TEMI
            </a>
            
            <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <i className="fas fa-cog mr-3 text-lg text-gray-400 group-hover:text-gray-500"></i>
              Settings
            </a>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div>
              <img 
                className="inline-block h-9 w-9 rounded-full object-cover" 
                src={user?.profileImage || "https://github.com/shadcn.png"} 
                alt="User profile"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {user?.firstName} {user?.lastName || "User"}
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                {user?.role || "Member"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
