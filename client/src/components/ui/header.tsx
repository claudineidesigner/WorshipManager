import React from "react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const { user } = useAuth();
  const logout = useLogout();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  return (
    <div className="lg:hidden bg-white shadow-sm fixed top-0 inset-x-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="text-gray-500 focus:outline-none"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        
        <div className="flex items-center space-x-2">
          <img 
            src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
            alt="Harmony logo" 
            className="h-8 w-8 rounded-md"
          />
          <span className="text-primary font-semibold text-lg">Harmony</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="p-0 h-8 w-8 rounded-full overflow-hidden border-2 border-transparent focus:border-gray-300"
            >
              <img 
                className="h-full w-full object-cover rounded-full" 
                src={user?.profileImage || "https://github.com/shadcn.png"} 
                alt="User profile"
              />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center p-2">
              <div className="ml-2 flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="text-sm">Your Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span className="text-sm">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logout.mutate()}
              className="text-red-600 focus:text-red-600"
            >
              <span className="text-sm">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
