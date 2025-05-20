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
import ConversationList from "@/components/messages/conversation-list";
import Conversation from "@/components/messages/conversation";

const Messages: React.FC = () => {
  const [activeConversation, setActiveConversation] = React.useState<any>(null);
  const [composeModalOpen, setComposeModalOpen] = React.useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
  });

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mt-14 lg:mt-0">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Communicate with your ministry team members.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Dialog open={composeModalOpen} onOpenChange={setComposeModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-pen mr-2"></i> New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>
                  Send a message to a team member or the entire ministry.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">To:</label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">Select recipient</option>
                    <option value="all">Entire Ministry</option>
                    <option value="1">David Wilson</option>
                    <option value="2">Sarah Johnson</option>
                    <option value="3">Michael Brown</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message:</label>
                  <textarea 
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                    placeholder="Type your message here..."
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setComposeModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Send Message
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex h-[500px]">
          {/* Conversation List */}
          <ConversationList 
            conversations={conversations || []}
            isLoading={isLoading}
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
          />

          {/* Conversation */}
          {activeConversation ? (
            <Conversation conversation={activeConversation} />
          ) : (
            <div className="hidden lg:flex lg:flex-col lg:w-2/3 lg:items-center lg:justify-center lg:p-6 lg:bg-gray-50">
              <div className="text-center">
                <div className="rounded-full bg-gray-100 p-6 mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                  <i className="fas fa-comments text-gray-400 text-3xl"></i>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a conversation from the list or start a new one.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setComposeModalOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <i className="fas fa-pen mr-2"></i> New Message
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
