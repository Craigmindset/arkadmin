"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Save, Plus, Trash2, Play, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface G2OVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
  uploadDate: string
  isActive: boolean
  views: number
}

const mockG2OVideos: G2OVideo[] = [
  {
    id: "G2O001",
    title: "Understanding God's Grace",
    description:
      "A deep dive into the concept of grace and how it transforms our daily lives through faith and prayer.",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    videoUrl: "/placeholder-video.mp4",
    duration: "15:30",
    uploadDate: "2024-01-15T10:00:00",
    isActive: true,
    views: 1250,
  },
  {
    id: "G2O002",
    title: "Prayer and Meditation",
    description: "Learn effective prayer techniques and meditation practices to strengthen your spiritual connection.",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    videoUrl: "/placeholder-video.mp4",
    duration: "22:15",
    uploadDate: "2024-01-12T14:30:00",
    isActive: true,
    views: 890,
  },
  {
    id: "G2O003",
    title: "Building Faith Community",
    description: "Discover how to build and maintain strong faith-based communities in modern times.",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    videoUrl: "/placeholder-video.mp4",
    duration: "18:45",
    uploadDate: "2024-01-10T16:20:00",
    isActive: false,
    views: 567,
  },
]

export default function VideoResourcesPage() {
  const [g2oVideos, setG2OVideos] = useState<G2OVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<G2OVideo | null>(null)
  const [videoToDelete, setVideoToDelete] = useState<G2OVideo | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailFile: null as File | null,
    videoFile: null as File | null,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setG2OVideos(mockG2OVideos)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleAddVideo = () => {
    setEditingVideo(null)
    setFormData({
      title: "",
      description: "",
      thumbnailFile: null,
      videoFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleEditVideo = (video: G2OVideo) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      thumbnailFile: null,
      videoFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleSaveVideo = async () => {
    if (editingVideo) {
      // Update existing video
      const updatedVideo = {
        ...editingVideo,
        title: formData.title,
        description: formData.description,
        thumbnailUrl: formData.thumbnailFile ? URL.createObjectURL(formData.thumbnailFile) : editingVideo.thumbnailUrl,
        videoUrl: formData.videoFile ? URL.createObjectURL(formData.videoFile) : editingVideo.videoUrl,
      }

      setG2OVideos(g2oVideos.map((video) => (video.id === editingVideo.id ? updatedVideo : video)))
      console.log("Updating G2O video in database:", updatedVideo)
    } else {
      // Add new video
      const newVideo: G2OVideo = {
        id: `G2O${String(g2oVideos.length + 1).padStart(3, "0")}`,
        title: formData.title,
        description: formData.description,
        thumbnailUrl: formData.thumbnailFile
          ? URL.createObjectURL(formData.thumbnailFile)
          : "/placeholder.svg?height=180&width=320",
        videoUrl: formData.videoFile ? URL.createObjectURL(formData.videoFile) : "/placeholder-video.mp4",
        duration: "00:00", // Would be calculated from actual video file
        uploadDate: new Date().toISOString(),
        isActive: true,
        views: 0,
      }

      setG2OVideos([...g2oVideos, newVideo])
      console.log("Saving new G2O video to database:", newVideo)
    }

    setIsDialogOpen(false)
    setEditingVideo(null)
  }

  const handleDeleteVideo = (video: G2OVideo) => {
    setVideoToDelete(video)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteVideo = async () => {
    if (videoToDelete) {
      setG2OVideos(g2oVideos.filter((video) => video.id !== videoToDelete.id))
      setIsDeleteDialogOpen(false)
      setVideoToDelete(null)
      console.log("Deleting G2O video from database:", videoToDelete.id)
    }
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, thumbnailFile: file })
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, videoFile: file })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if we can add more videos (max 10)
  const canAddMore = g2oVideos.length < 10

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Video Resources</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage exclusive video content for the G2O section. Maximum 10 videos allowed.
          </p>
        </div>
        {canAddMore && (
          <Button onClick={handleAddVideo}>
            <Plus className="mr-2 h-4 w-4" />
            Add Video
          </Button>
        )}
      </div>

      {!canAddMore && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Maximum limit reached:</strong> You have reached the maximum of 10 G2O exclusive videos. Delete an
            existing video to add a new one.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{g2oVideos.filter((v) => v.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{g2oVideos.reduce((sum, video) => sum + video.views, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>G2O Exclusive Videos</CardTitle>
          <CardDescription>Manage exclusive video content for the G2O section of the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {g2oVideos.map((video) => (
              <Card key={video.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={video.isActive ? "default" : "secondary"}>
                      {video.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => handleEditVideo(video)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteVideo(video)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100 group/thumbnail">
                    <img
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/thumbnail:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-2">{video.title}</CardTitle>
                    <CardDescription className="text-sm mb-3 line-clamp-2">{video.description}</CardDescription>
                    <div className="text-sm text-gray-600">
                      <span>{formatDate(video.uploadDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingVideo ? "Edit G2O Video" : "Add New G2O Video"}</DialogTitle>
            <DialogDescription>
              {editingVideo
                ? "Update the video details below."
                : "Fill in the details to upload a new G2O exclusive video."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter video title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter video description"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <div className="space-y-2">
                <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailUpload} />
                {(formData.thumbnailFile || (editingVideo && !formData.thumbnailFile)) && (
                  <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={
                        formData.thumbnailFile
                          ? URL.createObjectURL(formData.thumbnailFile)
                          : editingVideo?.thumbnailUrl || "/placeholder.svg"
                      }
                      alt="Thumbnail preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="video">Video File</Label>
              <div className="space-y-2">
                <Input id="video" type="file" accept="video/*" onChange={handleVideoUpload} />
                {formData.videoFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Upload className="h-4 w-4" />
                    <span>Video selected: {formData.videoFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVideo}>
              <Save className="mr-2 h-4 w-4" />
              {editingVideo ? "Save Changes" : "Upload Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Video Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video{" "}
              <strong>"{videoToDelete?.title}"</strong> and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVideo}>Delete Video</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
