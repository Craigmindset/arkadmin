"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Edit, Save, Plus, Trash2, Radio } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BroadcastEvent {
  id: string
  title: string
  description: string
  imageUrl: string
  eventTime: string
  isActive: boolean
  createdAt: string
}

const mockBroadcastEvents: BroadcastEvent[] = [
  {
    id: "BROADCAST001",
    title: "Sunday Morning Service",
    description: "Join us for our weekly Sunday morning worship service with inspiring messages and uplifting music.",
    imageUrl: "/placeholder.svg?height=200&width=300",
    eventTime: "2024-01-21T10:00:00",
    isActive: true,
    createdAt: "2024-01-15T08:00:00",
  },
  {
    id: "BROADCAST002",
    title: "Wednesday Bible Study",
    description: "Deep dive into God's word with our midweek Bible study session. All are welcome to join.",
    imageUrl: "/placeholder.svg?height=200&width=300",
    eventTime: "2024-01-24T19:00:00",
    isActive: true,
    createdAt: "2024-01-16T10:30:00",
  },
  {
    id: "BROADCAST003",
    title: "Youth Ministry Live",
    description: "Special broadcast for our youth ministry with games, worship, and relevant teachings.",
    imageUrl: "/placeholder.svg?height=200&width=300",
    eventTime: "2024-01-26T18:30:00",
    isActive: false,
    createdAt: "2024-01-17T14:15:00",
  },
]

export default function BroadcastUpdatePage() {
  const [broadcastEvents, setBroadcastEvents] = useState<BroadcastEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<BroadcastEvent | null>(null)
  const [eventToDelete, setEventToDelete] = useState<BroadcastEvent | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventTime: "",
    imageFile: null as File | null,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBroadcastEvents(mockBroadcastEvents)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleAddEvent = () => {
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      eventTime: "",
      imageFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleEditEvent = (event: BroadcastEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      eventTime: event.eventTime.slice(0, 16), // Format for datetime-local input
      imageFile: null,
    })
    setIsDialogOpen(true)
  }

  const handleSaveEvent = async () => {
    if (editingEvent) {
      // Update existing event
      const updatedEvent = {
        ...editingEvent,
        title: formData.title,
        description: formData.description,
        eventTime: formData.eventTime,
        imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : editingEvent.imageUrl,
      }

      setBroadcastEvents(broadcastEvents.map((event) => (event.id === editingEvent.id ? updatedEvent : event)))
      console.log("Updating broadcast event in database:", updatedEvent)
    } else {
      // Add new event
      const newEvent: BroadcastEvent = {
        id: `BROADCAST${String(broadcastEvents.length + 1).padStart(3, "0")}`,
        title: formData.title,
        description: formData.description,
        eventTime: formData.eventTime,
        imageUrl: formData.imageFile
          ? URL.createObjectURL(formData.imageFile)
          : "/placeholder.svg?height=200&width=300",
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      setBroadcastEvents([...broadcastEvents, newEvent])
      console.log("Saving new broadcast event to database:", newEvent)
    }

    setIsDialogOpen(false)
    setEditingEvent(null)
  }

  const handleDeleteEvent = (event: BroadcastEvent) => {
    setEventToDelete(event)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      setBroadcastEvents(broadcastEvents.filter((event) => event.id !== eventToDelete.id))
      setIsDeleteDialogOpen(false)
      setEventToDelete(null)
      console.log("Deleting broadcast event from database:", eventToDelete.id)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
    }
  }

  const formatEventTime = (eventTime: string) => {
    return new Date(eventTime).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if we can add more events (max 5)
  const canAddMore = broadcastEvents.length < 5

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Broadcast Update</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage live broadcasts and streaming content. Maximum 5 events allowed.
          </p>
        </div>
        {canAddMore && (
          <Button onClick={handleAddEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Broadcast Event
          </Button>
        )}
      </div>

      {!canAddMore && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Maximum limit reached:</strong> You have reached the maximum of 5 broadcast events. Delete an
            existing event to add a new one.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcastEvents.length}</div>
            <p className="text-xs text-muted-foreground">of 5 maximum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{broadcastEvents.filter((e) => e.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {broadcastEvents.filter((e) => new Date(e.eventTime) > new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {broadcastEvents.map((event) => (
          <Card key={event.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={event.isActive ? "default" : "secondary"}>
                  {event.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => handleEditEvent(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent(event)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                <CardDescription className="text-sm mb-3 line-clamp-3">{event.description}</CardDescription>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Event Time:</p>
                  <p>{formatEventTime(event.eventTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Broadcast Event" : "Add New Broadcast Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update the broadcast event details below."
                : "Fill in the details to create a new broadcast event."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eventTime">Event Time</Label>
              <Input
                id="eventTime"
                type="datetime-local"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Event Image</Label>
              <div className="space-y-2">
                <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                {(formData.imageFile || (editingEvent && !formData.imageFile)) && (
                  <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={
                        formData.imageFile
                          ? URL.createObjectURL(formData.imageFile)
                          : editingEvent?.imageUrl || "/placeholder.svg"
                      }
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent}>
              <Save className="mr-2 h-4 w-4" />
              {editingEvent ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the broadcast event{" "}
              <strong>"{eventToDelete?.title}"</strong> and remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent}>Delete Event</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
