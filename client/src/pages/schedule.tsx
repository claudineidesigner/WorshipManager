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
import Calendar from "@/components/schedule/calendar";
import ServiceForm from "@/components/schedule/service-form";
import { formatDate, formatTime } from "@/lib/utils";

const Schedule: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
  });
  
  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mt-14 lg:mt-0">Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize your ministry services and events.
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

      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth)}
              </h2>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Calendar 
            currentMonth={currentMonth} 
            events={services || []} 
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Services</h2>
        </div>

        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            <li className="px-6 py-5 text-center text-gray-500">Loading services...</li>
          ) : services && services.length > 0 ? (
            services.slice(0, 3).map((service, index) => (
              <li key={index}>
                <div className="px-6 py-5 flex items-center">
                  <div className="flex-shrink-0 flex-col items-center justify-center mr-4">
                    <div className="bg-primary-100 rounded-lg px-3 py-1.5 text-center">
                      <span className="text-xs font-medium text-primary-800">
                        {new Date(service.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </span>
                      <div className="text-xl font-semibold text-primary-800">
                        {new Date(service.date).getDate()}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900">{service.name}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <i className="fas fa-clock mr-1.5 text-gray-400"></i>
                      <span>{formatTime(service.time)}</span>
                    </div>
                    {service.members && service.members.length > 0 ? (
                      <div className="mt-2 flex items-center">
                        <div>
                          <div className="flex -space-x-1 overflow-hidden">
                            {service.members.slice(0, 3).map((member, idx) => (
                              <img 
                                key={idx}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" 
                                src={member.profileImage || "https://github.com/shadcn.png"} 
                                alt="Team member"
                              />
                            ))}
                            {service.members.length > 3 && (
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-500 text-xs">
                                +{service.members.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {service.members.length} team members scheduled
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          Needs team members
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <Button size="sm" variant="outline">
                      <i className="fas fa-edit"></i>
                    </Button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-5 text-center text-gray-500">No upcoming services</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Schedule;
