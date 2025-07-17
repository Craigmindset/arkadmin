"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Save, Plus, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HomeCard {
  id: string;
  title: string;
  imageUrl: string;
  buttonUrl: string;
  isActive: boolean;
}

interface SliderImage {
  id: string;
  title: string;
  imageUrl: string;
  buttonUrl: string;
  order: number;
}

const mockHomeCards: HomeCard[] = [
  {
    id: "CARD001",
    title: "Welcome to Ark of Light",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/welcome",
    isActive: true,
  },
  {
    id: "CARD002",
    title: "Sunday Service Live",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/live",
    isActive: true,
  },
  {
    id: "CARD003",
    title: "Prayer Requests",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/prayer",
    isActive: false,
  },
  {
    id: "CARD004",
    title: "Community Events",
    imageUrl: "/placeholder.svg?height=200&width=300",
    buttonUrl: "https://arkoflight.com/events",
    isActive: true,
  },
];

// Supabase client
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://pytofmzgoenrkwhjmtni.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dG9mbXpnb2Vucmt3aGptdG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTU2NjYsImV4cCI6MjA2ODI5MTY2Nn0.ACPdzGdpACTTEjj9YMTfdTVOM-3fZherlXe2J2gFqYc";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockSliderImages: SliderImage[] = [];

export default function HomeUpdatePage() {
  const [homeCards, setHomeCards] = useState<HomeCard[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isSliderDialogOpen, setIsSliderDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HomeCard | null>(null);
  const [cardFormData, setCardFormData] = useState({
    title: "",
    imageUrl: "",
    buttonUrl: "",
    imageFile: null as File | null,
  });
  // For per-slide editing
  const [editingSlide, setEditingSlide] = useState<SliderImage | null>(null);
  const [slideFormData, setSlideFormData] = useState({
    title: "",
    buttonUrl: "",
    imageFile: null as File | null,
    imageUrl: "",
    order: 1,
    id: "",
  });
  const [isSlideDialogOpen, setIsSlideDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch home cards (mocked)
    setHomeCards(mockHomeCards);
    // Fetch slides with id 1, 2, 3, 4 from Supabase
    const fetchSlides = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("slider")
        .select("id, title, image_url, button_link, sort_order")
        .in("id", [1, 2, 3, 4]);
      if (error) {
        setSliderImages([]);
      } else {
        const slides = (data || []).map((slide) => ({
          id: slide.id,
          title: slide.title,
          imageUrl: slide.image_url,
          buttonUrl: slide.button_link,
          order: slide.sort_order,
        }));
        setSliderImages(slides);
      }
      setIsLoading(false);
    };
    fetchSlides();
  }, []);

  const handleEditCard = (card: HomeCard) => {
    setEditingCard(card);
    setCardFormData({
      title: card.title,
      imageUrl: card.imageUrl,
      buttonUrl: card.buttonUrl,
      imageFile: null,
    });
    setIsCardDialogOpen(true);
  };

  const handleSaveCard = async () => {
    if (editingCard) {
      // Update existing card
      const updatedCard = {
        ...editingCard,
        title: cardFormData.title,
        imageUrl: cardFormData.imageFile
          ? URL.createObjectURL(cardFormData.imageFile)
          : cardFormData.imageUrl,
        buttonUrl: cardFormData.buttonUrl,
      };

      setHomeCards(
        homeCards.map((card) =>
          card.id === editingCard.id ? updatedCard : card
        )
      );
      setIsCardDialogOpen(false);
      setEditingCard(null);

      // Here you would make an actual API call to save to database
      console.log("Saving card to database:", updatedCard);
    }
  };

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCardFormData({ ...cardFormData, imageFile: file });
    }
  };

  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlideFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleSlideInputChange = (
    field: "title" | "buttonUrl",
    value: string
  ) => {
    setSlideFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save or update a single slide
  const handleSaveSlide = async () => {
    setIsLoading(true);
    let imageUrl = slideFormData.imageUrl;
    if (slideFormData.imageFile) {
      const fileExt = slideFormData.imageFile.name.split(".").pop();
      const fileName = `slider_${Date.now()}_${slideFormData.order}.${fileExt}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("slider-images")
        .upload(fileName, slideFormData.imageFile, { upsert: true });
      if (storageError) {
        alert(`Failed to upload image: ${storageError.message}`);
        setIsLoading(false);
        return;
      }
      imageUrl = supabase.storage.from("slider-images").getPublicUrl(fileName)
        .data.publicUrl;
    }

    // If slide has an id, update; else insert
    let dbResult;
    if (slideFormData.id) {
      dbResult = await supabase
        .from("slider")
        .update({
          image_url: imageUrl,
          title: slideFormData.title,
          button_link: slideFormData.buttonUrl,
          active: true,
          sort_order: slideFormData.order,
        })
        .eq("id", slideFormData.id)
        .select();
    } else {
      dbResult = await supabase
        .from("slider")
        .insert([
          {
            image_url: imageUrl,
            title: slideFormData.title,
            button_link: slideFormData.buttonUrl,
            active: true,
            sort_order: slideFormData.order,
          },
        ])
        .select();
    }
    const { data: dbData, error: dbError } = dbResult;
    if (dbError) {
      alert(`Failed to save slide: ${dbError.message}`);
      setIsLoading(false);
      return;
    }
    // Update local state
    let updatedSlides = [...sliderImages];
    const updatedSlide = {
      id: dbData?.[0]?.id || slideFormData.id || `SLIDE${slideFormData.order}`,
      title: slideFormData.title,
      imageUrl,
      buttonUrl: slideFormData.buttonUrl,
      order: slideFormData.order,
    };
    const idx = updatedSlides.findIndex((s) => s.order === slideFormData.order);
    if (idx !== -1) {
      updatedSlides[idx] = updatedSlide;
    } else {
      updatedSlides.push(updatedSlide);
    }
    setSliderImages(updatedSlides);
    setIsSlideDialogOpen(false);
    setIsLoading(false);
    alert("Slide updated!");
  };

  // Open dialog for editing a single slide
  const openSlideDialog = (slide?: SliderImage) => {
    if (slide) {
      setSlideFormData({
        title: slide.title,
        buttonUrl: slide.buttonUrl,
        imageFile: null,
        imageUrl: slide.imageUrl,
        order: slide.order,
        id: slide.id,
      });
    } else {
      // New slide (find next available order)
      const usedOrders = sliderImages.map((s) => s.order);
      let nextOrder = 1;
      while (usedOrders.includes(nextOrder) && nextOrder <= 4) nextOrder++;
      setSlideFormData({
        title: "",
        buttonUrl: "",
        imageFile: null,
        imageUrl: "",
        order: nextOrder,
        id: "",
      });
    }
    setIsSlideDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Home Update
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage home screen content and announcements displayed to users.
        </p>
      </div>

      {/* Image Slider Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Image Slider</h2>
            <p className="text-sm text-muted-foreground">
              Manage the main image slider displayed on the app home screen
            </p>
          </div>
          <Button onClick={() => openSlideDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Slide
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Slider Images</CardTitle>
            <CardDescription>
              These images are currently displayed in the app's main slider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sliderImages
                .sort((a, b) => a.order - b.order)
                .map((slide, index) => (
                  <div key={slide.id} className="space-y-2">
                    <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={slide.imageUrl || "/placeholder.svg"}
                        alt={slide.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">Slide {slide.order}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => openSlideDialog(slide)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{slide.title}</h4>
                      <p className="text-xs text-gray-600 break-all">
                        {slide.buttonUrl}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Home Cards Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Home Cards</h2>
          <p className="text-sm text-muted-foreground">
            Manage individual content cards displayed on the home screen
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {homeCards.map((card) => (
            <Card key={card.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={card.isActive ? "default" : "secondary"}>
                    {card.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditCard(card)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={card.imageUrl || "/placeholder.svg"}
                    alt={card.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg mb-2">{card.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 break-all">
                    URL: {card.buttonUrl}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Card Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Home Card</DialogTitle>
            <DialogDescription>
              Update the card content that will be displayed on the home screen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={cardFormData.title}
                onChange={(e) =>
                  setCardFormData({ ...cardFormData, title: e.target.value })
                }
                placeholder="Enter card title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Update Image</Label>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleCardImageUpload}
                />
                {(cardFormData.imageFile || cardFormData.imageUrl) && (
                  <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={
                        cardFormData.imageFile
                          ? URL.createObjectURL(cardFormData.imageFile)
                          : cardFormData.imageUrl
                      }
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buttonUrl">Button URL</Label>
              <Input
                id="buttonUrl"
                value={cardFormData.buttonUrl}
                onChange={(e) =>
                  setCardFormData({
                    ...cardFormData,
                    buttonUrl: e.target.value,
                  })
                }
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCard}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Slide Dialog */}
      <Dialog open={isSlideDialogOpen} onOpenChange={setIsSlideDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {slideFormData.id ? "Edit Slide" : "Add Slide"}
            </DialogTitle>
            <DialogDescription>
              {slideFormData.id
                ? `Update the content for Slide ${slideFormData.order}.`
                : `Add a new slide to the main slider.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slide-title">Title</Label>
              <Input
                id="slide-title"
                value={slideFormData.title}
                onChange={(e) =>
                  handleSlideInputChange("title", e.target.value)
                }
                placeholder="Enter slide title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slide-image">Image</Label>
              <Input
                id="slide-image"
                type="file"
                accept="image/*"
                onChange={handleSlideImageUpload}
              />
              {(slideFormData.imageFile || slideFormData.imageUrl) && (
                <div className="aspect-video w-full max-w-xs relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={
                      slideFormData.imageFile
                        ? URL.createObjectURL(slideFormData.imageFile)
                        : slideFormData.imageUrl || "/placeholder.svg"
                    }
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slide-url">Button URL</Label>
              <Input
                id="slide-url"
                value={slideFormData.buttonUrl}
                onChange={(e) =>
                  handleSlideInputChange("buttonUrl", e.target.value)
                }
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSlideDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSlide}>
              <Save className="mr-2 h-4 w-4" />
              Save Slide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
