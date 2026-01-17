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
import { Edit, Save, Heart, Clock, Loader2, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@supabase/supabase-js";

interface PrayerSlide {
  id: string;
  title: string;
  imageUrl: string;
  eventTime: string;
  frequency: "Daily" | "Weekly" | "Sunday" | "Mid Week" | "End of Month";
  isActive: boolean;
  order: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function PrayerUpdatePage() {
  const [prayerSlides, setPrayerSlides] = useState<PrayerSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<PrayerSlide | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<PrayerSlide | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    eventTime: "",
    frequency: "" as PrayerSlide["frequency"] | "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchPrayerSlides();
  }, []);

  const fetchPrayerSlides = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("prayer_update")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      const slides: PrayerSlide[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        imageUrl: item.image_url || "/placeholder.svg?height=300&width=600",
        eventTime: item.event_time,
        frequency: item.frequency || "Daily",
        isActive: item.active,
        order: item.sort_order || 0,
      }));

      setPrayerSlides(slides);
    } catch (error) {
      console.error("Error fetching prayer slides:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlide = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      eventTime: "",
      frequency: "Daily",
      imageUrl: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditSlide = (slide: PrayerSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      eventTime: slide.eventTime,
      frequency: slide.frequency,
      imageUrl: slide.imageUrl,
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

  const handleSaveSlide = async () => {
    if (!formData.title.trim() || !formData.eventTime || !formData.frequency) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.imageUrl) {
      alert("Please upload an image for the slide");
      return;
    }

    setIsSaving(true);

    try {
      if (editingSlide) {
        const { error } = await supabase
          .from("prayer_update")
          .update({
            title: formData.title,
            image_url: formData.imageUrl,
            event_time: formData.eventTime,
            frequency: formData.frequency,
            active: editingSlide.isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", Number(editingSlide.id));

        if (error) throw error;

        setPrayerSlides(
          prayerSlides.map((slide) =>
            slide.id === editingSlide.id
              ? {
                  ...slide,
                  title: formData.title,
                  imageUrl: formData.imageUrl,
                  eventTime: formData.eventTime,
                  frequency: formData.frequency as PrayerSlide["frequency"],
                }
              : slide,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("prayer_update")
          .insert([
            {
              title: formData.title,
              image_url: formData.imageUrl,
              event_time: formData.eventTime,
              frequency: formData.frequency,
              active: true,
              sort_order: prayerSlides.length + 1,
            },
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          const newSlide: PrayerSlide = {
            id: data[0].id.toString(),
            title: data[0].title,
            imageUrl:
              data[0].image_url || "/placeholder.svg?height=300&width=600",
            eventTime: data[0].event_time,
            frequency: data[0].frequency || "Daily",
            isActive: data[0].active,
            order: data[0].sort_order || 0,
          };
          setPrayerSlides([...prayerSlides, newSlide]);
        }
      }

      setIsDialogOpen(false);
      setEditingSlide(null);
    } catch (error) {
      console.error("Error saving prayer slide:", error);
      alert("Failed to save prayer slide");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = (slide: PrayerSlide) => {
    setSlideToDelete(slide);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSlide = async () => {
    if (slideToDelete) {
      try {
        const { error } = await supabase
          .from("prayer_update")
          .delete()
          .eq("id", Number(slideToDelete.id));

        if (error) throw error;

        setPrayerSlides(
          prayerSlides.filter((slide) => slide.id !== slideToDelete.id),
        );
      } catch (error) {
        console.error("Error deleting prayer slide:", error);
        alert("Failed to delete prayer slide");
      } finally {
        setIsDeleteDialogOpen(false);
        setSlideToDelete(null);
      }
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Daily":
        return "bg-blue-100 text-blue-800";
      case "Weekly":
        return "bg-green-100 text-green-800";
      case "Sunday":
        return "bg-purple-100 text-purple-800";
      case "Mid Week":
        return "bg-orange-100 text-orange-800";
      case "End of Month":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-screen overflow-y-auto pr-4">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Prayer Update
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage prayer room slider images and prayer schedule information
          displayed to users.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Prayer Slides
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prayerSlides.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Slides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prayerSlides.filter((s) => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prayerSlides.filter((s) => s.frequency === "Daily").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Prayers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                prayerSlides.filter((s) =>
                  ["Weekly", "Sunday", "Mid Week"].includes(s.frequency),
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Prayer Room Slider</CardTitle>
            <CardDescription>
              Manage the prayer room slider images and schedule information
            </CardDescription>
          </div>
          <Button onClick={handleAddSlide}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slide
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {prayerSlides.map((slide, index) => (
              <Card key={slide.id} className="relative group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Slide {index + 1}</Badge>
                      <Badge className={getFrequencyColor(slide.frequency)}>
                        {slide.frequency}
                      </Badge>
                      <Badge variant={slide.isActive ? "default" : "secondary"}>
                        {slide.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSlide(slide)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSlide(slide)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={slide.imageUrl || "/placeholder.svg"}
                      alt={slide.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-2">
                      {slide.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(slide.eventTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{slide.frequency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Add Prayer Slide Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSlide ? "Edit Prayer Slide" : "Add Prayer Slide"}
            </DialogTitle>
            <DialogDescription>
              {editingSlide
                ? "Update the prayer slide content and schedule information."
                : "Create a new prayer slide for the prayer room rotation."}
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
                placeholder="Enter prayer title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Slide Image (Max 5MB)</Label>
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

            <div className="grid gap-2">
              <Label htmlFor="eventTime">Event Time</Label>
              <Input
                id="eventTime"
                type="time"
                value={formData.eventTime}
                onChange={(e) =>
                  setFormData({ ...formData, eventTime: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    frequency: value as PrayerSlide["frequency"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                  <SelectItem value="Mid Week">Mid Week</SelectItem>
                  <SelectItem value="End of Month">End of Month</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleSaveSlide} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingSlide ? "Save Changes" : "Create Slide"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Prayer Slide Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              prayer slide <strong>"{slideToDelete?.title}"</strong> and remove
              it from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSlide}>
              Delete Slide
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
