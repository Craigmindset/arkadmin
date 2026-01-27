"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    genre: "" as string,
    image_url: "",
    audio_url: "",
    isUploadingImage: false,
    isUploadingAudio: false,
  });
  const [imageProgress, setImageProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.genre || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Supabase client - initialize once
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    // Initialize Supabase client only on client side
    if (typeof window !== "undefined") {
      const { createClient } = require("@supabase/supabase-js");
      setSupabase(createClient(supabaseUrl, supabaseAnonKey));
    }
  }, [supabaseUrl, supabaseAnonKey]);

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
  }, [supabase]);

  const handleAddSong = () => {
    setEditingSong(null);
    setFormData({
      title: "",
      artist: "",
      genre: "",
      image_url: "",
      audio_url: "",
      isUploadingImage: false,
      isUploadingAudio: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      genre: song.genre || "",
      image_url: song.image_url,
      audio_url: song.audio_url || "",
      isUploadingImage: false,
      isUploadingAudio: false,
    });
    setIsDialogOpen(true);
  };

  const handleSaveSong = async () => {
    setIsSaving(true);

    const logToServer = async (message: string, data?: any) => {
      try {
        await fetch("/api/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, data }),
        });
      } catch (err) {
        console.log("Failed to log to server:", err);
      }
    };

    await logToServer("Add button clicked");
    await logToServer("Form data", formData);
    await logToServer("Editing song", editingSong);

    // Validate required fields
    if (
      !formData.title ||
      !formData.artist ||
      !formData.image_url ||
      !formData.audio_url
    ) {
      await logToServer("Validation failed - missing fields");
      setIsSaving(false);
      setAlert({
        type: "error",
        message:
          "Please fill in all required fields and upload both image and audio files",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    await logToServer("Validation passed, proceeding with save");

    // Validate that URLs are from Cloudinary
    if (
      !formData.image_url.includes("cloudinary.com") ||
      !formData.audio_url.includes("cloudinary.com")
    ) {
      await logToServer("Invalid URLs - not from Cloudinary", {
        image_url: formData.image_url,
        audio_url: formData.audio_url,
      });
      setIsSaving(false);
      setAlert({
        type: "error",
        message:
          "Please upload files to Cloudinary first. Invalid file URLs detected.",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    await logToServer("Cloudinary URLs validated", {
      image_url: formData.image_url,
      audio_url: formData.audio_url,
    });

    // Insert or update in Supabase
    if (supabase) {
      try {
        if (editingSong) {
          // Update
          await logToServer("Updating existing song with ID", editingSong.id);
          const { data, error } = await supabase
            .from("music_library")
            .update({
              title: formData.title,
              artist: formData.artist,
              image_url: formData.image_url,
              audio_url: formData.audio_url,
              category: formData.genre,
            })
            .eq("id", editingSong.id)
            .select();
          await logToServer("Update response", { data, error });
          if (error) {
            await logToServer("Update error", error);
            setIsSaving(false);
            setAlert({
              type: "error",
              message: "Error updating song: " + error.message,
            });
            setTimeout(() => setAlert(null), 3000);
            return;
          }
          if (data && data[0]) {
            setSongs(
              songs.map((song) =>
                song.id === editingSong.id ? data[0] : song,
              ),
            );
            setIsSaving(false);
            setSuccessMessage("Song updated successfully!");
            setSuccessModal(true);
            setIsDialogOpen(false);
          }
        } else {
          // Insert
          await logToServer("Adding new song with data", formData);
          const { data, error } = await supabase
            .from("music_library")
            .insert([
              {
                title: formData.title,
                artist: formData.artist,
                image_url: formData.image_url,
                audio_url: formData.audio_url,
                category: formData.genre,
              },
            ])
            .select();
          await logToServer("Insert response", { data, error });
          if (error) {
            await logToServer("Insert error", error);
            setIsSaving(false);
            setAlert({
              type: "error",
              message: "Error adding song: " + error.message,
            });
            setTimeout(() => setAlert(null), 3000);
            return;
          }
          if (data && data[0]) {
            await logToServer("Song added successfully", data[0]);
            setSongs([...songs, data[0]]);
            setIsSaving(false);
            setSuccessMessage(
              `"${formData.title}" has been added successfully!`,
            );
            setSuccessModal(true);
            setIsDialogOpen(false);
            // Reset form
            setFormData({
              title: "",
              artist: "",
              genre: "",
              image_url: "",
              audio_url: "",
              isUploadingImage: false,
              isUploadingAudio: false,
            });
            setEditingSong(null);
          }
        }
      } catch (error) {
        setIsSaving(false);
        await logToServer("Unexpected error", error);
        setAlert({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } else {
      setIsSaving(false);
      await logToServer("Supabase client not initialized");
    }
  };

  const handleDeleteSong = async (songId: number) => {
    if (!supabase) {
      setAlert({
        type: "error",
        message: "Database not initialized",
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from("music_library")
        .delete()
        .eq("id", songId);

      if (error) {
        setAlert({
          type: "error",
          message: "Error deleting song: " + error.message,
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      // Remove from local state
      setSongs(songs.filter((song) => song.id !== songId));
      setAlert({
        type: "success",
        message: "Song deleted successfully!",
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message: "An error occurred while deleting the song",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleApproveSong = (songId: number) => {
    setSongs(
      songs.map((song) =>
        song.id === songId ? { ...song, status: "Approved" as const } : song,
      ),
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

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setAlert({
          type: "error",
          message: `Image file is too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      setFormData({ ...formData, isUploadingImage: true });
      setImageProgress(0);

      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("fileType", "image");

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setImageProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setFormData({
              ...formData,
              image_url: response.secure_url,
              isUploadingImage: false,
            });
            setImageProgress(0);
            setAlert({
              type: "success",
              message: "Image uploaded successfully!",
            });
            setTimeout(() => setAlert(null), 3000);
          }
        });

        xhr.addEventListener("error", () => {
          setFormData({ ...formData, isUploadingImage: false });
          setAlert({
            type: "error",
            message: "Image upload failed",
          });
          setTimeout(() => setAlert(null), 3000);
        });

        xhr.open("POST", "/api/upload");
        xhr.send(formDataUpload);
      } catch (error) {
        setFormData({ ...formData, isUploadingImage: false });
        setAlert({
          type: "error",
          message: "Image upload failed",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const handleAudioFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setAlert({
          type: "error",
          message: `Audio file is too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }

      setFormData({ ...formData, isUploadingAudio: true });
      setAudioProgress(0);

      try {
        // Upload directly to Cloudinary
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          throw new Error("Cloudinary configuration missing");
        }

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("upload_preset", uploadPreset);
        formDataUpload.append("folder", "arkoflight/music");

        const xhr = new XMLHttpRequest();
        
        // Set timeout to 5 minutes for large audio files
        xhr.timeout = 300000; // 5 minutes in milliseconds

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setAudioProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              setFormData({
                ...formData,
                audio_url: response.secure_url,
                isUploadingAudio: false,
              });
              setAudioProgress(0);
              setAlert({
                type: "success",
                message: "Audio uploaded successfully!",
              });
              setTimeout(() => setAlert(null), 3000);
            } catch (e) {
              console.error("Failed to parse response:", e);
              setFormData({ ...formData, isUploadingAudio: false });
              setAlert({
                type: "error",
                message: "Audio upload failed: Invalid response",
              });
              setTimeout(() => setAlert(null), 3000);
            }
          } else {
            console.error("Upload failed with status:", xhr.status, xhr.responseText);
            setFormData({ ...formData, isUploadingAudio: false });
            setAlert({
              type: "error",
              message: `Audio upload failed: Server returned ${xhr.status}`,
            });
            setTimeout(() => setAlert(null), 3000);
          }
        });

        xhr.addEventListener("error", () => {
          console.error("XHR error event triggered");
          setFormData({ ...formData, isUploadingAudio: false });
          setAlert({
            type: "error",
            message: "Audio upload failed: Network error",
          });
          setTimeout(() => setAlert(null), 3000);
        });
        
        xhr.addEventListener("timeout", () => {
          console.error("XHR timeout event triggered");
          setFormData({ ...formData, isUploadingAudio: false });
          setAlert({
            type: "error",
            message: "Audio upload timed out. Please try a smaller file or check your connection.",
          });
          setTimeout(() => setAlert(null), 5000);
        });

        // Upload directly to Cloudinary
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
        xhr.send(formDataUpload);
      } catch (error) {
        console.error("Upload exception:", error);
        setFormData({ ...formData, isUploadingAudio: false });
        setAlert({
          type: "error",
          message: "Audio upload failed: " + String(error),
        });
        setTimeout(() => setAlert(null), 3000);
      }
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
      {alert && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
            alert.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {alert.message}
        </div>
      )}
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
              className="transition-all duration-200 hover:opacity-90 active:opacity-70 active:scale-95 hover:shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Song
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  value={formData.genre || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, genre: value })
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
                <Label htmlFor="artistImage">Artist Image (required)</Label>
                <p className="text-xs text-muted-foreground">
                  Max file size: 10MB
                </p>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={formData.isUploadingImage}
                >
                  {formData.isUploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading to Cloudinary...
                    </>
                  ) : formData.image_url ? (
                    "Change Image"
                  ) : (
                    "Upload Image"
                  )}
                </Button>
                {formData.isUploadingImage && (
                  <div className="mt-2">
                    <Progress value={imageProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(imageProgress)}%
                    </p>
                  </div>
                )}
                {formData.image_url && !formData.isUploadingImage && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-20 w-20 rounded object-cover border"
                    />
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Uploaded to Cloudinary
                    </p>
                  </div>
                )}
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
                <Label htmlFor="songFile">Song File (required)</Label>{" "}
                <p className="text-xs text-muted-foreground">
                  Max file size: 10MB
                </p>{" "}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={formData.isUploadingAudio}
                >
                  {formData.isUploadingAudio ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading to Cloudinary...
                    </>
                  ) : formData.audio_url ? (
                    "Change Audio"
                  ) : (
                    "Upload Audio"
                  )}
                </Button>
                {formData.isUploadingAudio && (
                  <div className="mt-2">
                    <Progress value={audioProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(audioProgress)}%
                    </p>
                  </div>
                )}
                {formData.audio_url && !formData.isUploadingAudio && (
                  <div className="mt-2">
                    <audio
                      src={formData.audio_url}
                      controls
                      className="w-full h-8"
                    />
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Uploaded to Cloudinary
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSaveSong}
                disabled={
                  isSaving ||
                  formData.isUploadingImage ||
                  formData.isUploadingAudio
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingSong ? "Saving..." : "Adding Song..."}
                  </>
                ) : formData.isUploadingImage || formData.isUploadingAudio ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Files...
                  </>
                ) : editingSong ? (
                  "Save Changes"
                ) : (
                  "Add Song"
                )}
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

      {/* Success Modal */}
      <Dialog open={successModal} onOpenChange={setSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <DialogTitle className="text-2xl">Success!</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 py-4">{successMessage}</p>
          <DialogFooter className="flex justify-center">
            <Button onClick={() => setSuccessModal(false)} className="w-full">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
