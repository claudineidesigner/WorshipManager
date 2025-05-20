import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DashboardCard from "@/components/ui/dashboard-card";
import ServiceForm from "@/components/schedule/service-form";
import { formatDate, formatTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = React.useState(false);
  
  const { data: upcomingServices, isLoading: loadingServices } = useQuery({
    queryKey: ["/api/services/upcoming"],
  });
  
  const { data: teamMembers, isLoading: loadingTeam } = useQuery({
    queryKey: ["/api/team/members"],
  });
  
  const { data: songs, isLoading: loadingSongs } = useQuery({
    queryKey: ["/api/songs"],
  });
  
  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ["/api/activities"],
  });
  
  const nextService = upcomingServices && upcomingServices.length > 0 ? upcomingServices[0] : null;
  
  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mt-14 lg:mt-0">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.firstName || "User"}! Here's what's happening with your ministry.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i> Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service or event for your ministry team.
                </DialogDescription>
              </DialogHeader>
              <ServiceForm onSuccess={() => setModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Upcoming Services" 
          value={loadingServices ? "..." : upcomingServices?.length || 0} 
          icon="fa-calendar-alt" 
          color="primary" 
          viewAllLink="/schedule"
        />
        
        <DashboardCard 
          title="Team Members" 
          value={loadingTeam ? "..." : teamMembers?.length || 0} 
          icon="fa-users" 
          color="secondary" 
          viewAllLink="/team"
        />
        
        <DashboardCard 
          title="Song Library" 
          value={loadingSongs ? "..." : songs?.length || 0} 
          icon="fa-music" 
          color="accent" 
          viewAllLink="/songs"
        />
      </div>

      {nextService && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Next Service</h2>
          <div className="mt-3 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{nextService.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <i className="fas fa-clock mr-1.5 text-gray-400"></i>
                    <span>{formatDate(nextService.date)} • {formatTime(nextService.time)}</span>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <i className="fas fa-check-circle mr-1.5"></i>
                    {nextService.status === "ready" ? "Ready" : "Pending"}
                  </span>
                </div>
              </div>
              
              {nextService.members && nextService.members.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-medium text-gray-500">Team Members</h4>
                  <div className="mt-2 flex -space-x-1 overflow-hidden">
                    {nextService.members.slice(0, 4).map((member, index) => (
                      <img 
                        key={index}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                        src={member.profileImage || `https://github.com/shadcn.png`} 
                        alt={`Team member ${member.firstName}`}
                      />
                    ))}
                    {nextService.members.length > 4 && (
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-500 text-xs">
                        +{nextService.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {nextService.songs && nextService.songs.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-medium text-gray-500">Setlist</h4>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {nextService.songs.map((song, index) => (
                      <li key={index} className="py-2 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">{index + 1}. {song.title}</span>
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            {song.key}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-gray-500">
                            <i className="fas fa-music"></i>
                          </button>
                          <button className="text-gray-400 hover:text-gray-500">
                            <i className="fas fa-play"></i>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-end space-x-3">
              <Button variant="outline">
                <i className="fas fa-edit mr-2"></i> Edit Service
              </Button>
              
              <Button>
                <i className="fas fa-share mr-2"></i> Send Notifications
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-3 bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {loadingActivities ? (
              <li className="px-6 py-4 text-center text-gray-500">Loading activities...</li>
            ) : activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <li key={index} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={activity.user.profileImage || "https://github.com/shadcn.png"} 
                        alt="User"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.timeAgo}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-4 text-center text-gray-500">No recent activities</li>
            )}
          </ul>
          <div className="bg-gray-50 px-6 py-3">
            <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all activity
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
