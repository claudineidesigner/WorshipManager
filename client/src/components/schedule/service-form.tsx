import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { insertServiceSchema } from "@shared/schema";

// Extended schema with validations
const formSchema = insertServiceSchema.extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  memberIds: z.array(z.number()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ServiceFormProps {
  serviceId?: number;
  onSuccess?: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, onSuccess }) => {
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = React.useState<any[]>([]);
  
  // Fetch service data if editing
  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ["/api/services", serviceId],
    enabled: !!serviceId,
  });
  
  // Fetch ministry members
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["/api/team/members"],
  });
  
  // Fetch user's ministries
  const { data: ministries, isLoading: isLoadingMinistries } = useQuery({
    queryKey: ["/api/ministries"],
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ministryId: 0,
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      type: "Sunday Service",
      notes: "",
      memberIds: [],
    },
  });
  
  // Update form when service data is loaded
  React.useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        ministryId: service.ministryId,
        date: new Date(service.date).toISOString().split("T")[0],
        time: service.time,
        type: service.type,
        notes: service.notes,
        memberIds: service.members?.map(m => m.id) || [],
      });
      
      if (service.members) {
        setSelectedMembers(service.members);
      }
    }
  }, [service, form]);
  
  // Create/update service
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = serviceId
        ? `/api/services/${serviceId}`
        : "/api/services";
      const method = serviceId ? "PUT" : "POST";
      
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services/upcoming"] });
      
      toast({
        title: serviceId ? "Service updated" : "Service created",
        description: serviceId
          ? "The service has been updated successfully."
          : "A new service has been created successfully.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormData) => {
    data.memberIds = selectedMembers.map(m => m.id);
    mutation.mutate(data);
  };
  
  const addMember = (member: any) => {
    if (!selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
      form.setValue("memberIds", [...selectedMembers.map(m => m.id), member.id]);
    }
  };
  
  const removeMember = (memberId: number) => {
    const newMembers = selectedMembers.filter(m => m.id !== memberId);
    setSelectedMembers(newMembers);
    form.setValue("memberIds", newMembers.map(m => m.id));
  };
  
  const isLoading = isLoadingService || isLoadingMembers || isLoadingMinistries || mutation.isPending;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Sunday Celebration Service" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                  <SelectItem value="Midweek Service">Midweek Service</SelectItem>
                  <SelectItem value="Youth Service">Youth Service</SelectItem>
                  <SelectItem value="Special Event">Special Event</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ministryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ministry</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
                disabled={isLoading || !ministries || ministries.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ministry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ministries?.map((ministry) => (
                    <SelectItem key={ministry.id} value={ministry.id.toString()}>
                      {ministry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special notes for this service..." 
                  {...field} 
                  rows={3}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Team Members</FormLabel>
          <div className="mt-1">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedMembers.map((member) => (
                <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.profileImage || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{member.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{member.firstName} {member.lastName}</span>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 ml-1 text-gray-400 hover:text-gray-600"
                    onClick={() => removeMember(member.id)}
                    disabled={isLoading}
                  >
                    <i className="fas fa-times-circle"></i>
                  </Button>
                </Badge>
              ))}
              <Select
                onValueChange={(value) => {
                  const selectedMember = members?.find(m => m.id.toString() === value);
                  if (selectedMember) {
                    addMember(selectedMember);
                  }
                }}
                disabled={isLoading || !members || members.length === 0}
              >
                <SelectTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">
                    <i className="fas fa-plus mr-1"></i> Add Team Member
                  </Button>
                </SelectTrigger>
                <SelectContent>
                  {members?.filter(m => !selectedMembers.find(sm => sm.id === m.id))
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                {serviceId ? "Updating..." : "Creating..."}
              </span>
            ) : (
              serviceId ? "Update Service" : "Create Service"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;
