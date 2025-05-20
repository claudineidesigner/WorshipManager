import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MemberForm from "@/components/team/member-form";
import TeamCard from "@/components/team/team-card";

const Team: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/team/members"],
  });
  
  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mt-14 lg:mt-0">Team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your ministry's team members and their roles.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-user-plus mr-2"></i> Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your ministry team.
                </DialogDescription>
              </DialogHeader>
              <MemberForm onSuccess={() => setModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          // Loading placeholders
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white shadow rounded-lg overflow-hidden animate-pulse">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded-full w-4"></div>
              </div>
            </div>
          ))
        ) : members && members.length > 0 ? (
          members.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <i className="fas fa-users text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No team members yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first team member.
            </p>
            <div className="mt-6">
              <Button onClick={() => setModalOpen(true)}>
                <i className="fas fa-user-plus mr-2"></i> Add Team Member
              </Button>
            </div>
          </div>
        )}
      </div>

      {members && members.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Team Availability</h2>
          </div>

          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jun 25</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jun 28</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jul 2</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jul 5</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jul 9</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.slice(0, 4).map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img className="h-8 w-8 rounded-full object-cover" src={member.profileImage || "https://github.com/shadcn.png"} alt="Team member" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <i className={`fas fa-${Math.random() > 0.3 ? 'check-circle text-green-500' : 'times-circle text-red-500'}`}></i>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <i className={`fas fa-${Math.random() > 0.3 ? 'check-circle text-green-500' : 'times-circle text-red-500'}`}></i>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <i className={`fas fa-${Math.random() > 0.3 ? 'check-circle text-green-500' : 'times-circle text-red-500'}`}></i>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <i className={`fas fa-${Math.random() > 0.3 ? 'check-circle text-green-500' : 'times-circle text-red-500'}`}></i>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <i className={`fas fa-${Math.random() > 0.3 ? 'check-circle text-green-500' : 'times-circle text-red-500'}`}></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
