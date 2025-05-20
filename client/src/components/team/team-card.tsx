import React from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import MemberForm from "./member-form";

interface TeamCardProps {
  member: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage?: string;
    position?: string;
    role?: string;
    availability?: "available" | "unavailable" | "limited";
    unavailableUntil?: string;
  };
}

const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/team/members/${member.id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      toast({
        title: "Team member removed",
        description: "The member has been removed from your team.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove the team member. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const getAvailabilityBadge = () => {
    if (member.availability === "available") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <i className="fas fa-check-circle mr-1"></i>
          Available
        </span>
      );
    } else if (member.availability === "unavailable") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <i className="fas fa-times-circle mr-1"></i>
          {member.unavailableUntil ? `Unavailable until ${member.unavailableUntil}` : "Unavailable"}
        </span>
      );
    } else if (member.availability === "limited") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <i className="fas fa-exclamation-circle mr-1"></i>
          Limited availability
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        <i className="fas fa-check-circle mr-1"></i>
        Available
      </span>
    );
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img 
              className="h-14 w-14 rounded-full object-cover" 
              src={member.profileImage || "https://github.com/shadcn.png"} 
              alt={`${member.firstName} ${member.lastName}`}
            />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{member.firstName} {member.lastName}</h3>
            <div className="flex flex-wrap items-center mt-1 gap-1">
              {member.role && (
                <Badge variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                  {member.role}
                </Badge>
              )}
              {member.position && (
                <Badge variant="outline">
                  {member.position}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <i className="fas fa-envelope mr-2 text-gray-400"></i>
            <span>{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <i className="fas fa-phone mr-2 text-gray-400"></i>
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        {getAvailabilityBadge()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-gray-500"
            >
              <i className="fas fa-ellipsis-v"></i>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
              <i className="fas fa-edit mr-2"></i> Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => {
                if (confirm("Are you sure you want to remove this team member?")) {
                  deleteMutation.mutate();
                }
              }}
            >
              <i className="fas fa-user-minus mr-2"></i> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the details for this team member.
            </DialogDescription>
          </DialogHeader>
          <MemberForm 
            memberId={member.id} 
            onSuccess={() => setEditModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamCard;
