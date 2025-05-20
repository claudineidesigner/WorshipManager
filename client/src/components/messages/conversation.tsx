import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ConversationProps {
  conversation: any;
}

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormData = z.infer<typeof messageSchema>;

const Conversation: React.FC<ConversationProps> = ({ conversation }) => {
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const res = await apiRequest("POST", `/api/messages/${conversation.id}`, {
        content: data.content,
        recipientId: conversation.isGroup ? null : conversation.id,
        ministryId: conversation.ministryId || 1,
      });
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", conversation.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "An error occurred while sending your message.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };
  
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation.messages]);
  
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-2/3">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center">
        <div className="flex-shrink-0">
          {conversation.isGroup ? (
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              {conversation.name?.substring(0, 3).toUpperCase()}
            </div>
          ) : (
            <Avatar>
              <AvatarImage src={conversation.avatar || "https://github.com/shadcn.png"} />
              <AvatarFallback>{conversation.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{conversation.name}</p>
          <p className="text-xs text-gray-500">{conversation.status || conversation.position}</p>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-phone"></i>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-video"></i>
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-info-circle"></i>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((message: any, index: number) => (
              <div 
                key={index} 
                className={`flex ${message.isCurrentUser ? 'justify-end' : ''}`}
              >
                {!message.isCurrentUser && (
                  <div className="flex-shrink-0 mr-3">
                    <Avatar>
                      <AvatarImage src={message.sender?.avatar || "https://github.com/shadcn.png"} />
                      <AvatarFallback>{message.sender?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div>
                  <div 
                    className={`${
                      message.isCurrentUser 
                        ? 'bg-primary-100 text-gray-900' 
                        : 'bg-gray-100 text-gray-900'
                    } rounded-lg p-4 max-w-xs`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`mt-1 text-xs text-gray-500 ${message.isCurrentUser ? 'text-right' : ''}`}>
                    {message.timestamp 
                      ? format(new Date(message.timestamp), 'h:mm a')
                      : 'Just now'
                    }
                  </p>
                </div>
                {message.isCurrentUser && (
                  <div className="flex-shrink-0 ml-3">
                    <Avatar>
                      <AvatarImage src={message.sender?.avatar || "https://github.com/shadcn.png"} />
                      <AvatarFallback>{message.sender?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Start the conversation by sending a message</p>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-500 mr-2"
          >
            <i className="fas fa-paperclip text-lg"></i>
          </Button>
          <Input
            className="flex-1"
            placeholder="Type your message..."
            {...form.register("content")}
          />
          <Button 
            type="submit" 
            size="icon"
            className="ml-2 rounded-full"
            disabled={sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
        {form.formState.errors.content && (
          <p className="mt-1 text-xs text-red-500">{form.formState.errors.content.message}</p>
        )}
      </div>
    </div>
  );
};

export default Conversation;
