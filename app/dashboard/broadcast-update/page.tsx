"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Save, Plus, Trash2, Radio, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@supabase/supabase-js";

interface BroadcastEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventTime: string;
  isActive: boolean;
  createdAt: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function BroadcastUpdatePage() {
  const [broadcastEvents, setBroadcastEvents] = useState<BroadcastEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BroadcastEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<BroadcastEvent | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventTime: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchBroadcastEvents();
  }, []);

  const fetchBroadcastEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("broadcast_update")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const events: BroadcastEvent[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description || "",
        imageUrl: item.image_url || "/placeholder.svg?height=200&width=300",
        eventTime: item.event_time,
        isActive: item.active,
        createdAt: item.created_at,
      }));

      setBroadcastEvents(events);
    } catch (error) {
      console.error("Error fetching broadcast events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      eventTime: "",
      imageUrl: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: BroadcastEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventTime: event.eventTime.slice(0, 16), // Format for datetime-local input
      imageUrl: event.imageUrl,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(
          "Image file is too large. Maximum size is 5MB. Please choose a smaller file.",
        );
        e.target.value = "";
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("fileType", "image");

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setImageProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFormData((prev) => ({ ...prev, imageUrl: response.secure_url }));
          setImageProgress(0);
        } else {
          alert("Failed to upload image");
          setImageProgress(0);
        }
      });

      xhr.addEventListener("error", () => {
        alert("Error uploading image");
        setImageProgress(0);
      });

      xhr.open("POST", "/api/upload", true);
      xhr.send(formDataUpload);
    }
  };

  const handleSaveEvent = async () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.eventTime
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.imageUrl) {
      alert("Please upload an image for the event");
      return;
    }

    setIsSaving(true);

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("broadcast_update")
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.imageUrl,
            event_time: formData.eventTime,
            active: editingEvent.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", Number(editingEvent.id));

        if (error) throw error;

        // Update local state
        setBroadcastEvents(
          broadcastEvents.map((event) =>
            event.id === editingEvent.id
              ? {
                  ...event,
                  title: formData.title,
                  description: formData.description,
                  imageUrl: formData.imageUrl,
                  eventTime: formData.eventTime,
                }
              : event,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("broadcast_update")
          .insert([
            {
              title: formData.title,
              description: formData.description,
              image_url: formData.imageUrl,
              event_time: formData.eventTime,
              active: true,
            },
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          const newEvent: BroadcastEvent = {
            id: data[0].id.toString(),
            title: data[0].title,
            description: data[0].description || "",
            imageUrl:
              data[0].image_url || "/placeholder.svg?height=200&width=300",
            eventTime: data[0].event_time,
            isActive: data[0].active,
            createdAt: data[0].created_at,
          };
          setBroadcastEvents([newEvent, ...broadcastEvents]);
        }
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Error saving broadcast event:", error);
      alert("Failed to save broadcast event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (event: BroadcastEvent) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        const { error } = await supabase
          .from("broadcast_update")
          .delete()
          .eq("id", Number(eventToDelete.id));

        if (error) throw error;

        setBroadcastEvents(
          broadcastEvents.filter((event) => event.id !== eventToDelete.id),
        );
      } catch (error) {
        console.error("Error deleting broadcast event:", error);
        alert("Failed to delete broadcast event");
      } finally {
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
      }
    }
  };

  const formatEventTime = (eventTime: string) => {
    return new Date(eventTime).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if we can add more events (max 5)
  const canAddMore = broadcastEvents.length < 5;

  return (
    <div className="space-y-6 h-screen overflow-y-auto pr-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Broadcast Update
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage live broadcasts and streaming content. Maximum 5 events
            allowed.
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
            <strong>Maximum limit reached:</strong> You have reached the maximum
            of 5 broadcast events. Delete an existing event to add a new one.
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
            <div className="text-2xl font-bold">
              {broadcastEvents.filter((e) => e.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                broadcastEvents.filter(
                  (e) => new Date(e.eventTime) > new Date(),
                ).length
              }
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteEvent(event)}
                  >
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
                <CardDescription className="text-sm mb-3 line-clamp-3">
                  {event.description}
                </CardDescription>
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
            <DialogTitle>
              {editingEvent
                ? "Edit Broadcast Event"
                : "Add New Broadcast Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update the broadcast event details below."
                : "Fill in the details to create a new broadcast event."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter event title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, eventTime: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Event Image (Max 5MB)</Label>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageProgress > 0}
                />
                {imageProgress > 0 && (
                  <div className="space-y-2">
                    <Progress value={imageProgress} className="w-full" />
                    <p className="text-sm text-gray-600">
                      Uploading to Cloudinary... {imageProgress}%
                    </p>
                  </div>
                )}
                {formData.imageUrl && (
                  <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingEvent ? "Save Changes" : "Create Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              broadcast event <strong>"{eventToDelete?.title}"</strong> and
              remove it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent}>
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
