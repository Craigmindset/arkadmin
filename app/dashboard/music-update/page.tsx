"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
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
} from "@/components/ui/alert-dialog"

interface Song {
  id: string
  title: string
  artist: string
  album: string
  genre: "Worship" | "Praise" | "Hymns" | "Seraphs" | "Macwealth"
  status: "Approved" | "Pending" | "Draft"
}

const mockSongs: Song[] = [
  {
    id: "SNG001",
    title: "Amazing Grace",
    artist: "John Newton",
    album: "Classic Hymns",
    genre: "Hymns",
    status: "Approved",
  },
  {
    id: "SNG002",
    title: "How Great Thou Art",
    artist: "Carl Boberg",
    album: "Worship Collection",
    genre: "Worship",
    status: "Approved",
  },
  {
    id: "SNG003",
    title: "Blessed Be Your Name",
    artist: "Matt Redman",
    album: "Modern Praise",
    genre: "Praise",
    status: "Pending",
  },
]

export default function MusicUpdatePage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "" as Song["genre"] | "",
    artistImage: null as File | null,
    songFile: null as File | null,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSongs(mockSongs)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleAddSong = () => {
    setEditingSong(null)
    setFormData({
      title: "",
      artist: "",
      album: "",
      genre: "",
      artistImage: null,
      songFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleEditSong = (song: Song) => {
    setEditingSong(song)
    setFormData({
      title: song.title,
      artist: song.artist,
      album: song.album,
      genre: song.genre,
      artistImage: null,
      songFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleSaveSong = () => {
    if (editingSong) {
      // Update existing song
      setSongs(
        songs.map((song) =>
          song.id === editingSong.id ? { ...song, ...formData, genre: formData.genre as Song["genre"] } : song,
        ),
      )
    } else {
      // Add new song
      const newSong: Song = {
        id: `SNG${String(songs.length + 1).padStart(3, "0")}`,
        title: formData.title,
        artist: formData.artist,
        album: formData.album,
        genre: formData.genre as Song["genre"],
        status: "Draft",
      }
      setSongs([...songs, newSong])
    }
    setIsDialogOpen(false)
  }

  const handleDeleteSong = (songId: string) => {
    setSongs(songs.filter((song) => song.id !== songId))
  }

  const handleApproveSong = (songId: string) => {
    setSongs(songs.map((song) => (song.id === songId ? { ...song, status: "Approved" as const } : song)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Manage Music Library</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Add, edit, and manage songs in the Ark of Light music library.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddSong}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Song
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSong ? "Edit Song" : "Add New Song"}</DialogTitle>
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
                  onValueChange={(value) => setFormData({ ...formData, genre: value as Song["genre"] })}
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
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Enter artist name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="artistImage">Artist Image</Label>
                <Input
                  id="artistImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, artistImage: e.target.files?.[0] || null })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="album">Album Title</Label>
                <Input
                  id="album"
                  value={formData.album}
                  onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                  placeholder="Enter album title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Song Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter song title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="songFile">Song File</Label>
                <Input
                  id="songFile"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFormData({ ...formData, songFile: e.target.files?.[0] || null })}
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
          <CardDescription>All songs currently in the database with their details and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Song Title</TableHead>
                <TableHead>Artist Name</TableHead>
                <TableHead>Album Title</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell>{song.album}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{song.genre}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(song.status)}>{song.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {song.status !== "Approved" && (
                        <Button size="sm" onClick={() => handleApproveSong(song.id)}>
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEditSong(song)}>
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
                              This action cannot be undone. This will permanently delete the song "{song.title}" from
                              the music library.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSong(song.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
