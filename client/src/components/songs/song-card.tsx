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
import SongForm from "./song-form";

interface SongCardProps {
  song: {
    id: number;
    title: string;
    artist?: string;
    key?: string;
    bpm?: number;
    category?: string;
    chordLink?: string;
    lyricsLink?: string;
    audioLink?: string;
    videoLink?: string;
  };
}

const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  
  const openLink = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Link not available",
        description: "This song doesn't have this reference link available.",
        variant: "destructive",
      });
    }
  };
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/songs/${song.id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Song deleted",
        description: "The song has been removed from your library.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the song. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return (
    <li className="px-6 py-4 flex items-center hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">{song.title}</h3>
          <div className="flex items-center space-x-2">
            {song.key && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {song.key}
              </span>
            )}
            {song.bpm && (
              <span className="text-gray-500 text-sm">{song.bpm} BPM</span>
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center text-sm">
          {song.artist && (
            <>
              <span className="text-gray-500">{song.artist}</span>
              <span className="mx-2 text-gray-300">•</span>
            </>
          )}
          {song.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {song.category}
            </span>
          )}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-gray-500"
          onClick={() => openLink(song.chordLink)}
          disabled={!song.chordLink}
        >
          <i className="fas fa-music"></i>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-gray-500"
          onClick={() => openLink(song.audioLink || song.videoLink)}
          disabled={!song.audioLink && !song.videoLink}
        >
          <i className="fas fa-play"></i>
        </Button>
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
                if (confirm("Are you sure you want to delete this song?")) {
                  deleteMutation.mutate();
                }
              }}
            >
              <i className="fas fa-trash-alt mr-2"></i> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Song</DialogTitle>
            <DialogDescription>
              Update the details for this song.
            </DialogDescription>
          </DialogHeader>
          <SongForm 
            songId={song.id} 
            onSuccess={() => setEditModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </li>
  );
};

export default SongCard;
