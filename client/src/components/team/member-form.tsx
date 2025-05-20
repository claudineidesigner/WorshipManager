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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { insertMinistryMemberSchema } from "@shared/schema";

// Extended schema with validations
const formSchema = z.object({
  userId: z.number().optional(),
  ministryId: z.number(),
  role: z.string().min(1, "Role is required"),
  position: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  availability: z.enum(["available", "unavailable", "limited"]).default("available"),
  unavailableUntil: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MemberFormProps {
  memberId?: number;
  onSuccess?: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ memberId, onSuccess }) => {
  const { toast } = useToast();
  
  // Fetch member data if editing
  const { data: member, isLoading: isLoadingMember } = useQuery({
    queryKey: ["/api/team/members", memberId],
    enabled: !!memberId,
  });
  
  // Fetch user's ministries
  const { data: ministries, isLoading: isLoadingMinistries } = useQuery({
    queryKey: ["/api/ministries"],
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: undefined,
      ministryId: 0,
      role: "Member",
      position: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      availability: "available",
      unavailableUntil: "",
    },
  });
  
  // Update form when member data is loaded
  React.useEffect(() => {
    if (member) {
      form.reset({
        userId: member.userId,
        ministryId: member.ministryId,
        role: member.role,
        position: member.position || "",
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone || "",
        availability: member.availability || "available",
        unavailableUntil: member.unavailableUntil || "",
      });
    }
  }, [member, form]);
  
  // Create/update member
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = memberId
        ? `/api/team/members/${memberId}`
        : "/api/team/members";
      const method = memberId ? "PUT" : "POST";
      
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members"] });
      
      toast({
        title: memberId ? "Member updated" : "Member added",
        description: memberId
          ? "The team member has been updated successfully."
          : "A new team member has been added successfully.",
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
    mutation.mutate(data);
  };
  
  const isLoading = isLoadingMember || isLoadingMinistries || mutation.isPending;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Email address" 
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Phone number (optional)" 
                  {...field} 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Leader">Worship Leader</SelectItem>
                    <SelectItem value="Member">Team Member</SelectItem>
                    <SelectItem value="Admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position/Instrument</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="Vocalist">Vocalist</SelectItem>
                    <SelectItem value="Acoustic Guitar">Acoustic Guitar</SelectItem>
                    <SelectItem value="Electric Guitar">Electric Guitar</SelectItem>
                    <SelectItem value="Bass">Bass</SelectItem>
                    <SelectItem value="Drums">Drums</SelectItem>
                    <SelectItem value="Piano">Piano</SelectItem>
                    <SelectItem value="Keyboard">Keyboard</SelectItem>
                    <SelectItem value="Strings">Strings</SelectItem>
                    <SelectItem value="Brass">Brass</SelectItem>
                    <SelectItem value="Woodwind">Woodwind</SelectItem>
                    <SelectItem value="Sound Engineer">Sound Engineer</SelectItem>
                    <SelectItem value="Projection">Projection/Slides</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
          name="availability"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="available" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Available
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="limited" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Limited availability
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="unavailable" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Unavailable
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("availability") === "unavailable" && (
          <FormField
            control={form.control}
            name="unavailableUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unavailable Until</FormLabel>
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
        )}
        
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
                {memberId ? "Updating..." : "Adding..."}
              </span>
            ) : (
              memberId ? "Update Member" : "Add Member"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MemberForm;
