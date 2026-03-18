"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash } from "lucide-react";

interface G20Item {
  id: number;
  sortOrder: number;
  title: string;
  image: string;
  videoUrl: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function G20UpdatePage() {
  const [items, setItems] = useState<G20Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    bannerPosition: "",
    title: "",
    imageUrl: "",
    videoUrl: "",
    imageFile: null as File | null,
  });

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("g20")
        .select("id, sort_order, title, image, video_url")
        .order("sort_order", { ascending: true });
      if (error) {
        setItems([]);
      } else {
        const mapped = (data || []).map((row, index) => ({
          id: row.id,
          sortOrder: row.sort_order ?? index + 1,
          title: row.title,
          image: row.image,
          videoUrl: row.video_url,
        }));
        setItems(mapped);
      }
      setIsLoading(false);
    };

    fetchItems();
  }, []);

  const openAddDialog = () => {
    const usedOrders = items
      .map((item) => item.sortOrder)
      .filter((n) => typeof n === "number");
    let nextOrder = 1;
    while (usedOrders.includes(nextOrder)) nextOrder++;
    setFormData({
      bannerPosition: nextOrder.toString(),
      title: "",
      imageUrl: "",
      videoUrl: "",
      imageFile: null,
    });
    setIsDialogOpen(true);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(
        `Image file is too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("fileType", "image");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.secure_url,
          imageFile: file,
        }));
      } else {
        alert(`Failed to upload image: ${data.error}`);
      }
    } catch (_error) {
      alert("Failed to upload image");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    const bannerPositionNumber = Number(formData.bannerPosition);
    const title = formData.title.trim();
    const videoUrl = formData.videoUrl.trim();

    if (
      !bannerPositionNumber ||
      Number.isNaN(bannerPositionNumber) ||
      bannerPositionNumber <= 0
    ) {
      alert("Banner position is required and must be a positive number");
      setIsLoading(false);
      return;
    }
    if (!title) {
      alert("Title is required");
      setIsLoading(false);
      return;
    }
    if (!formData.imageUrl) {
      alert("Poster image is required");
      setIsLoading(false);
      return;
    }
    if (!videoUrl) {
      alert("Video URL is required");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("g20")
      .insert([
        {
          sort_order: bannerPositionNumber,
          title,
          image: formData.imageUrl,
          video_url: videoUrl,
        },
      ])
      .select();

    if (error) {
      alert(`Failed to save G20 banner: ${error.message}`);
      setIsLoading(false);
      return;
    }

    const inserted = data?.[0];
    if (inserted) {
      const newItem: G20Item = {
        id: inserted.id,
        sortOrder: inserted.sort_order ?? bannerPositionNumber,
        title: inserted.title,
        image: inserted.image,
        videoUrl: inserted.video_url,
      };
      setItems((prev) =>
        [...prev, newItem].sort((a, b) => a.sortOrder - b.sortOrder),
      );
    }

    setIsDialogOpen(false);
    setIsLoading(false);
    alert("G20 banner added!");
  };

  const handleDelete = async (item: G20Item) => {
    const confirmed = window.confirm(
      `Delete Banner ${item.sortOrder}? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setIsLoading(true);
    const { error } = await supabase.from("g20").delete().eq("id", item.id);
    if (error) {
      alert(`Failed to delete G20 banner: ${error.message}`);
      setIsLoading(false);
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    setIsLoading(false);
    alert("G20 banner deleted!");
  };

  if (isLoading && !isDialogOpen) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            G20 Update
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage G20 related banners and video links.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            Current G20 Banners
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Banners are displayed in the order of their Banner position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No G20 banners yet. Click "Add Banner" to create one.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                          Banner {item.sortOrder}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="shadow-md"
                          onClick={() => handleDelete(item)}
                          title="Delete banner"
                          aria-label="Delete banner"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-sm md:text-base mb-1">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs break-all">
                        {item.videoUrl}
                      </CardDescription>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add G20 Banner</DialogTitle>
            <DialogDescription>
              Configure the banner position, title, poster image, and video URL
              for this G20 banner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid gap-2">
              <Label htmlFor="g20-position">Banner position</Label>
              <Input
                id="g20-position"
                type="number"
                min={1}
                value={formData.bannerPosition}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    bannerPosition: numericValue,
                  }));
                }}
                placeholder="1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="g20-title">Title</Label>
              <Input
                id="g20-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter banner title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="g20-poster">Poster</Label>
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB
              </p>
              <Input
                id="g20-poster"
                type="file"
                accept="image/*"
                onChange={handlePosterUpload}
              />
              {(formData.imageFile || formData.imageUrl) && (
                <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={
                      formData.imageFile
                        ? URL.createObjectURL(formData.imageFile)
                        : formData.imageUrl
                    }
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="g20-video-url">Video URL</Label>
              <Input
                id="g20-video-url"
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
                placeholder="https://example.com/video"
                type="url"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.bannerPosition ||
                Number.isNaN(Number(formData.bannerPosition)) ||
                Number(formData.bannerPosition) <= 0 ||
                !formData.title.trim() ||
                !formData.imageUrl ||
                !formData.videoUrl.trim()
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
