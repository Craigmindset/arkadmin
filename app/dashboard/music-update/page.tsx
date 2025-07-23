"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Song {
  id: number;
  title: string;
  artist: string;
  image_url: string;
  audio_url?: string | null;
  created_at?: string | null;
  genre?: string | null;
}

export default function MusicUpdatePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    genre: "" as string,
    imageFile: null as File | null,
    audioFile: null as File | null,
    image_url: "",
    audio_url: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.genre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Supabase client
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://pytofmzgoenrkwhjmtni.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dG9mbXpnb2Vucmt3aGptdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU2NjYsImV4cCI6MjA2ODI5MTY2Nn0.ACPdzGdpACTTEjj9YMTfdTVOM-3fZherlXe2J2gFqYc";
  const supabase =
    typeof window !== "undefined"
      ? require("@supabase/supabase-js").createClient(
          supabaseUrl,
          supabaseAnonKey
        )
      : null;

  useEffect(() => {
    const fetchSongs = async () => {
      if (supabase) {
        const { data, error } = await supabase
          .from("music_library")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          setSongs(data);
        }
      }
      setIsLoading(false);
    };
    fetchSongs();
  }, []);

  const handleAddSong = () => {
    setEditingSong(null);
    setFormData({
      title: "",
      artist: "",
      genre: "",
      imageFile: null,
      audioFile: null,
      image_url: "",
      audio_url: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      genre: song.genre || "",
      imageFile: null,
      audioFile: null,
      image_url: song.image_url,
      audio_url: song.audio_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveSong = async () => {
    let image_url = formData.image_url;
    let audio_url = formData.audio_url;
    // Upload image if selected
    if (formData.imageFile && supabase) {
      const fileExt = formData.imageFile.name.split(".").pop();
      const fileName = `artist_${Date.now()}.${fileExt}`;
      const { data: imgData, error: imgError } = await supabase.storage
        .from("music-library")
        .upload(fileName, formData.imageFile, { upsert: true });
      if (imgError) {
        alert("Image upload failed: " + imgError.message);
        return;
      } else {
        image_url = supabase.storage
          .from("music-library")
          .getPublicUrl(fileName).data.publicUrl;
      }
    }
    // Upload audio if selected
    if (formData.audioFile && supabase) {
      const fileExt = formData.audioFile.name.split(".").pop();
      const fileName = `audio_${Date.now()}.${fileExt}`;
      const { data: audData, error: audError } = await supabase.storage
        .from("music-library")
        .upload(fileName, formData.audioFile, { upsert: true });
      if (audError) {
        alert("Audio upload failed: " + audError.message);
        return;
      } else {
        audio_url = supabase.storage
          .from("music-library")
          .getPublicUrl(fileName).data.publicUrl;
      }
    }
    // Insert or update in Supabase
    if (supabase) {
      if (editingSong) {
        // Update
        const { data, error } = await supabase
          .from("music_library")
          .update({
            title: formData.title,
            artist: formData.artist,
            image_url,
            audio_url,
            genre: formData.genre,
          })
          .eq("id", editingSong.id)
          .select();
        if (!error && data && data[0]) {
          setSongs(
            songs.map((song) => (song.id === editingSong.id ? data[0] : song))
          );
        }
      } else {
        // Insert
        const { data, error } = await supabase
          .from("music_library")
          .insert([
            {
              title: formData.title,
              artist: formData.artist,
              image_url,
              audio_url,
              genre: formData.genre,
            },
          ])
          .select();
        if (!error && data && data[0]) {
          setSongs([...songs, data[0]]);
        }
      }
    }
    setIsDialogOpen(false);
  };

  const handleDeleteSong = (songId: string) => {
    setSongs(songs.filter((song) => song.id !== songId));
  };

  const handleApproveSong = (songId: string) => {
    setSongs(
      songs.map((song) =>
        song.id === songId ? { ...song, status: "Approved" as const } : song
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Manage Music Library
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Add, edit, and manage songs in the Ark of Light music library.
          </p>
          <div className="mt-2">
            <Input
              type="text"
              placeholder="Search by title, artist, or genre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-sm"
            />
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddSong}
              className="transition-opacity duration-150 hover:opacity-80 active:opacity-60"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Song
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSong ? "Edit Song" : "Add New Song"}
              </DialogTitle>
              <DialogDescription>
                {editingSong
                  ? "Make changes to the song details below."
                  : "Fill in the details to add a new song to the library."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) =>
                    setFormData({ ...formData, genre: value as Song["genre"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Worship">Worship</SelectItem>
                    <SelectItem value="Praise">Praise</SelectItem>
                    <SelectItem value="Hymns">Hymns</SelectItem>
                    <SelectItem value="Seraphs">Seraphs</SelectItem>
                    <SelectItem value="Macwealth">Macwealth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="artist">Artist Name</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  placeholder="Enter artist name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="artistImage">Artist Image</Label>
                <Input
                  id="artistImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      imageFile: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                {/* Album removed, not in music_library table */}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Song Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter song title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="songFile">Song File</Label>
                <Input
                  id="songFile"
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audioFile: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveSong}>
                {editingSong ? "Save Changes" : "Add Song"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Music Library</CardTitle>
          <CardDescription>
            All songs currently in the database with their details and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist Image</TableHead>
                <TableHead>Song Title</TableHead>
                <TableHead>Artist Name</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSongs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell>
                    <img
                      src={song.image_url || "/placeholder-user.jpg"}
                      alt={song.artist}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{song.genre}</Badge>
                  </TableCell>
                  <TableCell>
                    {song.created_at
                      ? new Date(song.created_at).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSong(song)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the song "{song.title}" from
                              the music library.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSong(song.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
