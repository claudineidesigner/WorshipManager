import React from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: any[];
  isLoading: boolean;
  activeConversation: any;
  setActiveConversation: (conversation: any) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  activeConversation,
  setActiveConversation
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const filteredConversations = React.useMemo(() => {
    if (!conversations) return [];
    
    return conversations.filter((conversation) => 
      !searchTerm || 
      conversation.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);
  
  return (
    <div className="w-full lg:w-1/3 border-r border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <Input
            type="text"
            className="pl-10"
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ul className="divide-y divide-gray-200 overflow-y-auto h-[calc(500px-65px)]">
        {isLoading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="px-6 py-4">
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
              </div>
            </li>
          ))
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation, index) => (
            <li 
              key={index} 
              className={cn(
                "px-6 py-4 cursor-pointer",
                activeConversation?.id === conversation.id ? "bg-primary-50" : "hover:bg-gray-50"
              )}
              onClick={() => setActiveConversation(conversation)}
            >
              <div className="flex items-center space-x-3">
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{conversation.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.sender ? `${conversation.sender}: ` : ''}
                    {conversation.lastMessage}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-gray-500">
                      {conversation.timestamp 
                        ? formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: false })
                        : 'Now'
                      }
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="mt-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-primary-600 text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No conversations found</p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ConversationList;
