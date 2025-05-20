import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SongCard from "@/components/songs/song-card";
import SongForm from "@/components/songs/song-form";

const Songs: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [keyFilter, setKeyFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  
  const { data: songs, isLoading } = useQuery({
    queryKey: ["/api/songs"],
  });
  
  // Filter songs based on search and filters
  const filteredSongs = React.useMemo(() => {
    if (!songs) return [];
    
    return songs.filter((song) => {
      const matchesSearch = search === "" || 
        song.title.toLowerCase().includes(search.toLowerCase()) ||
        (song.artist && song.artist.toLowerCase().includes(search.toLowerCase()));
      
      const matchesKey = keyFilter === "all" || song.key === keyFilter;
      
      const matchesCategory = categoryFilter === "all" || song.category === categoryFilter;
      
      return matchesSearch && matchesKey && matchesCategory;
    });
  }, [songs, search, keyFilter, categoryFilter]);
  
  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mt-14 lg:mt-0">Songs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your ministry's song library and repertoire.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i> Add Song
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Song</DialogTitle>
                <DialogDescription>
                  Add a new song to your ministry's repertoire.
                </DialogDescription>
              </DialogHeader>
              <SongForm onSuccess={() => setModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <Input
                placeholder="Search for songs"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Select
              value={keyFilter}
              onValueChange={setKeyFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Keys" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Keys</SelectItem>
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
            
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Worship">Worship</SelectItem>
                <SelectItem value="Praise">Praise</SelectItem>
                <SelectItem value="Hymn">Hymn</SelectItem>
                <SelectItem value="Communion">Communion</SelectItem>
                <SelectItem value="Special">Special</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              className="hidden sm:flex"
            >
              <i className="fas fa-sliders-h"></i>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Song Library</h2>
          <span className="text-sm text-gray-500">
            {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            <li className="px-6 py-4 text-center text-gray-500">Loading songs...</li>
          ) : filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              {search || keyFilter !== "all" || categoryFilter !== "all" 
                ? "No songs match your filters" 
                : "No songs in the library"}
            </li>
          )}
        </ul>

        {filteredSongs.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <nav className="flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredSongs.length, 6)}</span> of <span className="font-medium">{filteredSongs.length}</span> results
                </p>
              </div>
              <div className="flex-1 flex justify-between sm:justify-end space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={filteredSongs.length <= 6}>
                  Next
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Songs;
