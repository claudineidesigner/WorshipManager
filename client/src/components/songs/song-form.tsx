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
import { insertSongSchema } from "@shared/schema";

// Extended schema with validations
const formSchema = insertSongSchema.extend({
  title: z.string().min(1, "Title is required"),
  artist: z.string().optional(),
  key: z.string().optional(),
  bpm: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
  duration: z.string().optional(),
  category: z.string().optional(),
  chordLink: z.string().url().optional().or(z.literal("")),
  lyricsLink: z.string().url().optional().or(z.literal("")),
  audioLink: z.string().url().optional().or(z.literal("")),
  videoLink: z.string().url().optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface SongFormProps {
  songId?: number;
  onSuccess?: () => void;
}

const SongForm: React.FC<SongFormProps> = ({ songId, onSuccess }) => {
  const { toast } = useToast();
  
  // Fetch song data if editing
  const { data: song, isLoading: isLoadingSong } = useQuery({
    queryKey: ["/api/songs", songId],
    enabled: !!songId,
  });
  
  // Fetch user's ministries
  const { data: ministries, isLoading: isLoadingMinistries } = useQuery({
    queryKey: ["/api/ministries"],
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artist: "",
      key: "",
      bpm: "",
      duration: "",
      category: "",
      ministryId: 0,
      chordLink: "",
      lyricsLink: "",
      audioLink: "",
      videoLink: "",
    },
  });
  
  // Update form when song data is loaded
  React.useEffect(() => {
    if (song) {
      form.reset({
        title: song.title,
        artist: song.artist || "",
        key: song.key || "",
        bpm: song.bpm ? song.bpm.toString() : "",
        duration: song.duration || "",
        category: song.category || "",
        ministryId: song.ministryId,
        chordLink: song.chordLink || "",
        lyricsLink: song.lyricsLink || "",
        audioLink: song.audioLink || "",
        videoLink: song.videoLink || "",
      });
    }
  }, [song, form]);
  
  // Create/update song
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = songId
        ? `/api/songs/${songId}`
        : "/api/songs";
      const method = songId ? "PUT" : "POST";
      
      const res = await apiRequest(method, endpoint, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      
      toast({
        title: songId ? "Song updated" : "Song added",
        description: songId
          ? "The song has been updated successfully."
          : "The song has been added to your library.",
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
  
  const isLoading = isLoadingSong || isLoadingMinistries || mutation.isPending;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Song title" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="artist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist/Composer</FormLabel>
                <FormControl>
                  <Input placeholder="Artist or composer name" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select key" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No Key</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A#/Bb">A#/Bb</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C#/Db">C#/Db</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D#/Eb">D#/Eb</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="F#/Gb">F#/Gb</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="G#/Ab">G#/Ab</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bpm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BPM</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Tempo" 
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
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. 4:30" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    <SelectItem value="Worship">Worship</SelectItem>
                    <SelectItem value="Praise">Praise</SelectItem>
                    <SelectItem value="Hymn">Hymn</SelectItem>
                    <SelectItem value="Communion">Communion</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
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
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Reference Links</h3>
          
          <FormField
            control={form.control}
            name="chordLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chord Chart URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/chords" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormDescription>
                  Link to chord chart (e.g., Cifra Club)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lyricsLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lyrics URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/lyrics" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormDescription>
                  Link to lyrics (e.g., Letras.mus.br)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="audioLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/audio" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormDescription>
                  Link to audio (e.g., Spotify, Deezer)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="videoLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/video" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormDescription>
                  Link to video (e.g., YouTube)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                {songId ? "Updating..." : "Adding..."}
              </span>
            ) : (
              songId ? "Update Song" : "Add Song"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SongForm;
